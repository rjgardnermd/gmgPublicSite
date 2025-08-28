import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { reporterApi } from '../api/reporterApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLoading, setSuccess, setError } from '../store/slices/tagHierarchySlice';
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
    const dispatch = useAppDispatch();
    const { data: tagHierarchy, status, error } = useAppSelector(state => state.tagHierarchy);
    const { data: twrData } = useAppSelector(state => state.twrUpdate);
    const [currentNode, setCurrentNode] = useState<TagHierarchyNode | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

    // Call the reporter API to get tag hierarchy
    useEffect(() => {
        const fetchTagHierarchy = async () => {
            dispatch(setLoading());
            try {
                const data = await reporterApi.getTagHierarchy();
                console.log('Tag hierarchy data:', data);
                dispatch(setSuccess(data));
                setCurrentNode(data);
                setBreadcrumb([data.name]);
            } catch (error) {
                console.error('Failed to fetch tag hierarchy:', error);
                dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch data'));
            }
        };

        fetchTagHierarchy();
    }, [dispatch]);

    // Helper function to normalize values to sum to 100
    const normalizeValues = (nodes: TagHierarchyNode[]): TreeMapData[] => {
        const totalValue = nodes.reduce((sum, node) => sum + node.value, 0);

        return nodes.map((child, index) => ({
            name: child.name,
            value: totalValue > 0 ? (child.value / totalValue) * 100 : 0,
            color: getColorForIndex(index),
            node: child
        }));
    };

    // Format TWR as percentage
    const formatTWR = (twr: number): string => {
        const percentage = twr * 100;
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
    };

    useEffect(() => {
        if (!svgRef.current || !currentNode) return;

        // Convert current node to TreeMap format with normalized values
        const data: TreeMapNode = {
            name: currentNode.name,
            children: normalizeValues(currentNode.children)
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
            .text(d => `${d.data.value.toFixed(1)}%`);

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

    // Show loading state
    if (status === 'loading') {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Stock Sector TreeMap</h1>
                <p>Loading...</p>
            </div>
        );
    }

    // Show error state
    if (status === 'failed') {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Stock Sector TreeMap</h1>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            {/* TWR Display */}
            {twrData && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: twrData.twr >= 0 ? '#28a745' : '#dc3545'
                    }}>
                        TWR: {formatTWR(twrData.twr)}
                    </div>
                </div>
            )}

            <h1>Portfolio Composition</h1>
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
