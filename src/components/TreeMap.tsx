import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { hubApi } from '../api/hubApi';
import type { TagHierarchyNode } from '../models/TagHierarchy';

interface TreeMapData {
    name: string;
    value: number;
    color: string;
    node: TagHierarchyNode; // Store reference to original node
}

interface TreeMapNode {
    name: string;
    children: TreeMapData[];
}

const TreeMap: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tagHierarchy, setTagHierarchy] = useState<TagHierarchyNode | null>(null);
    const [currentNode, setCurrentNode] = useState<TagHierarchyNode | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

    // Call the hub API to get tag hierarchy
    useEffect(() => {
        const fetchTagHierarchy = async () => {
            try {
                const data = await hubApi.getTagHierarchy();
                console.log('Tag hierarchy data:', data);
                setTagHierarchy(data);
                setCurrentNode(data);
                setBreadcrumb([data.name]);
            } catch (error) {
                console.error('Failed to fetch tag hierarchy:', error);
            }
        };

        fetchTagHierarchy();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !currentNode) return;

        // Convert current node to TreeMap format
        const data: TreeMapNode = {
            name: currentNode.name,
            children: currentNode.children.map((child, index) => ({
                name: child.name,
                value: child.value,
                color: getColorForIndex(index),
                node: child
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
                handleNodeClick(d.data.node);
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

    }, [currentNode]);

    // Handle node click for drill-down
    const handleNodeClick = (node: TagHierarchyNode) => {
        console.log("Clicked on:", node.name);

        if (node.children && node.children.length > 0) {
            // Drill down to children
            setCurrentNode(node);
            setBreadcrumb([...breadcrumb, node.name]);
        } else {
            // This is a leaf node (symbol level)
            console.log("Reached symbol level:", node);
        }
    };

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (index: number) => {
        if (index === 0) {
            // Go back to root
            setCurrentNode(tagHierarchy);
            setBreadcrumb([tagHierarchy!.name]);
        } else {
            // Navigate to specific level
            const newBreadcrumb = breadcrumb.slice(0, index + 1);
            setBreadcrumb(newBreadcrumb);

            // Find the node at this level
            let targetNode = tagHierarchy;
            for (let i = 1; i <= index; i++) {
                const childName = newBreadcrumb[i];
                targetNode = targetNode!.children.find(child => child.name === childName)!;
            }
            setCurrentNode(targetNode);
        }
    };

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

            {/* Breadcrumb navigation */}
            {breadcrumb.length > 1 && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#2c3e50', borderRadius: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ecf0f1' }}>Navigation: </span>
                    {breadcrumb.map((item, index) => (
                        <span key={index}>
                            <button
                                onClick={() => handleBreadcrumbClick(index)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#3498db',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    margin: '0 5px',
                                    fontWeight: '500'
                                }}
                            >
                                {item}
                            </button>
                            {index < breadcrumb.length - 1 && <span style={{ color: '#95a5a6' }}> → </span>}
                        </span>
                    ))}
                </div>
            )}

            <svg ref={svgRef} style={{ border: '1px solid #ccc', borderRadius: '8px' }}></svg>
        </div>
    );
};

export default TreeMap;
