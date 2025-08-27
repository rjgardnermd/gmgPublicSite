import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { hubApi } from '../api/hubApi';
import type { TagHierarchyNode } from '../models/TagHierarchy';

interface TreeMapData {
    name: string;
    value: number;
    color: string;
}

interface TreeMapNode {
    name: string;
    children: TreeMapData[];
}

const TreeMap: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tagHierarchy, setTagHierarchy] = useState<TagHierarchyNode | null>(null);

    // Call the hub API to get tag hierarchy
    useEffect(() => {
        const fetchTagHierarchy = async () => {
            try {
                const data = await hubApi.getTagHierarchy();
                console.log('Tag hierarchy data:', data);
                setTagHierarchy(data);
            } catch (error) {
                console.error('Failed to fetch tag hierarchy:', error);
            }
        };

        fetchTagHierarchy();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !tagHierarchy) return;

        // Convert tag hierarchy to TreeMap format
        const data: TreeMapNode = {
            name: tagHierarchy.name,
            children: tagHierarchy.children.map((child, index) => ({
                name: child.name,
                value: child.value,
                color: getColorForIndex(index)
            }))
        };

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up dimensions
        const width = 800;
        const height = 600;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Create treemap layout
        const treemap = d3.treemap<TreeMapData>()
            .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
            .padding(2);

        // Create root node
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Generate treemap
        treemap(root);

        // Create rectangles for each sector
        const nodes = svg.selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0 + margin.left}, ${d.y0 + margin.top})`);

        // Add rectangles
        nodes.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d.data.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("click", function (event, d) {
                console.log("Clicked on:", d.data.name);
            });

        // Add labels
        nodes.append("text")
            .attr("x", d => (d.x1 - d.x0) / 2)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("font-size", d => Math.min(16, (d.x1 - d.x0) / 8))
            .style("pointer-events", "none")
            .text(d => d.data.name);

        // Add value labels
        nodes.append("text")
            .attr("x", d => (d.x1 - d.x0) / 2)
            .attr("y", d => (d.y1 - d.y0) / 2 + 20)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "white")
            .attr("font-size", d => Math.min(12, (d.x1 - d.x0) / 10))
            .style("pointer-events", "none")
            .text(d => `${d.data.value}%`);

    }, [tagHierarchy]);

    // Helper function to generate colors for different sectors
    const getColorForIndex = (index: number): string => {
        const colors = [
            "#2196F3", // Blue
            "#FF9800", // Orange
            "#4CAF50", // Green
            "#9C27B0", // Purple
            "#F44336", // Red
            "#607D8B", // Blue Grey
            "#795548", // Brown
            "#FF5722", // Deep Orange
            "#00BCD4", // Cyan
            "#E91E63"  // Pink
        ];
        return colors[index % colors.length];
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Stock Sector TreeMap</h1>
            <p>Visualization of different stock sectors and their relative weights</p>
            <svg ref={svgRef} style={{ border: '1px solid #ccc', borderRadius: '8px' }}></svg>
        </div>
    );
};

export default TreeMap;
