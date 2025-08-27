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
        // Sample data for 6 stock sectors
        const data: TreeMapNode = {
            name: "root",
            children: [
                { name: "Tech", value: 30, color: "#2196F3" },
                { name: "Energy", value: 25, color: "#FF9800" },
                { name: "Healthcare", value: 20, color: "#4CAF50" },
                { name: "Finance", value: 15, color: "#9C27B0" },
                { name: "Consumer", value: 8, color: "#F44336" },
                { name: "Industrial", value: 2, color: "#607D8B" }
            ]
        };

        if (!svgRef.current) return;

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

    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Stock Sector TreeMap</h1>
            <p>Visualization of different stock sectors and their relative weights</p>
            {tagHierarchy && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h3>Loaded Tag Hierarchy:</h3>
                    <p><strong>Root Name:</strong> {tagHierarchy.name}</p>
                    <p><strong>Total Value:</strong> {tagHierarchy.value}</p>
                    <p><strong>Number of Top-Level Tags:</strong> {tagHierarchy.children.length}</p>
                </div>
            )}
            <svg ref={svgRef} style={{ border: '1px solid #ccc', borderRadius: '8px' }}></svg>
        </div>
    );
};

export default TreeMap;
