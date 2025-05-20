/**
 * Visualization module for rendering graph data with D3
 */
console.log("Visualization module loaded");

const Visualization = (function () {
  // Default options
  const defaultOptions = {
    showLabels: true,
    showRelationships: false,
    nodeSize: "medium",
  };

  // Visualization state
  let svg = null;
  let graphData = null;
  let visualOptions = { ...defaultOptions };
  let simulation = null;
  let dimensions = { width: 0, height: 0 };
  let zoomG = null; // Store reference to the zoomed group
  let tooltip = null; // Custom tooltip element
  let nodeTooltip = null; // Node tooltip element
  let selectedLink = null; // Track the currently selected link
  let edgeColorScale = null; // Store the color scale for edges
  let strokeWidthScale = null; // Store the stroke width scale

  // Initialize visualization
  function init(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error("Container not found:", containerSelector);
      return;
    }

    // Create SVG element if it doesn't exist
    if (!svg) {
      svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
      
      // Create a group that will contain all elements and be transformed by zoom
      zoomG = svg.append("g").attr("class", "zoom-group");

      // Add zoom behavior
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 10])
          .on("zoom", (event) => {
            const { transform } = event;
            zoomG.attr("transform", transform);
          })
      );
    }

    // Create fixed tooltip panel on the right side of the screen
    if (!tooltip) {
      tooltip = d3.select(container)
        .append("div")
        .attr("class", "visualization-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(255, 255, 255, 0.95)")
        .style("color", "#333")
        .style("border", "1px solid #ddd")
        .style("border-radius", "6px")
        .style("padding", "15px")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.15)")
        .style("max-width", "280px")
        .style("width", "300px")
        .style("height", "auto")
        .style("max-height", "80%")
        .style("overflow-y", "auto")
        .style("z-index", "1000")
        .style("transition", "opacity 0.25s")
        .style("right", "20px")
        .style("top", "20px");
      
      // Add a close button to the tooltip
      tooltip.append("div")
        .attr("class", "tooltip-close-btn")
        .style("position", "absolute")
        .style("top", "5px")
        .style("right", "10px")
        .style("cursor", "pointer")
        .style("font-size", "18px")
        .style("color", "#999")
        .html("&times;")
        .on("click", () => {
          // Hide tooltip and deselect the link
          hideTooltip();
          unselectLink();
        });
    }
    
    // Create node tooltip that follows the cursor
    if (!nodeTooltip) {
      nodeTooltip = d3.select(container)
        .append("div")
        .attr("class", "node-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(255, 255, 255, 0.95)")
        .style("color", "#333")
        .style("border", "1px solid #ddd")
        .style("border-radius", "6px")
        .style("padding", "10px")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.15)")
        .style("max-width", "280px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("opacity", "0")
        .style("transform", "translate(-50%, -100%)")  // Position tooltip above cursor
        .style("margin-top", "-5px")  // Small offset to not touch the cursor
        .style("transition", "opacity 0.15s");
    }

    // Handle window resize
    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return svg;
  }

  // Update container dimensions
  function updateDimensions() {
    const container = document.querySelector("#visualization");
    if (container) {
      const rect = container.getBoundingClientRect();
      dimensions = { width: rect.width, height: rect.height };

      if (graphData) {
        render(graphData, visualOptions);
      }
      
      // Reposition the tooltip if it exists
      if (tooltip) {
        tooltip
          .style("right", "20px")
          .style("top", "20px");
      }
    }
  }

  // Function to unselect the currently selected link
  function unselectLink() {
    if (selectedLink) {
      d3.select(selectedLink).select("line")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", d => strokeWidthScale(d.properties?.count || 1))
        .attr("stroke", d => edgeColorScale(d.properties?.count || 1)); // Explicitly reset color
      selectedLink = null;
    }
  }

  // Function to show the tooltip
  function showTooltip(content) {
    tooltip
      .html("")  // Clear the tooltip first
      .style("visibility", "visible")
      .style("opacity", 1);
    
    // Append content to the tooltip
    tooltip.html(content);
    
    // Re-attach click event to the close button
    tooltip.select(".tooltip-close-btn")
      .on("click", () => {
        // Hide tooltip and deselect the link
        hideTooltip();
        unselectLink();
      });
  }
  
  // Function to show node tooltip - Using client coordinates for reliable positioning
  function showNodeTooltip(content, x, y) {
    // Get container's position to calculate relative coordinates
    const container = document.querySelector("#visualization");
    const rect = container.getBoundingClientRect();
    
    // Calculate position relative to the container
    const leftPos = x - rect.left;
    const topPos = y - rect.top;
    
    nodeTooltip
      .html(content)
      .style("left", leftPos + "px")  // Position based on calculated coordinates 
      .style("top", topPos + "px")    // Position based on calculated coordinates
      .style("visibility", "visible")
      .style("opacity", 1);
  }
  
  // Function to hide node tooltip
  function hideNodeTooltip() {
    nodeTooltip
      .style("opacity", 0)
      .style("visibility", "hidden");
  }

  // Function to hide the tooltip
  function hideTooltip() {
    tooltip
      .style("opacity", 0)
      .style("visibility", "hidden");
  }

  // Format tooltip content with HTML for better styling
  function formatNodeTooltip(d, totalCount) {
    const label = d.labels && d.labels.includes("Person") ? d.properties.emailAdd : d.id;
    
    return `
      <div class="tooltip-header" style="font-weight: bold; border-bottom: 1px solid #eaeaea; margin-bottom: 8px; padding-bottom: 5px;">
        ${label}
      </div>
      <div class="tooltip-content">
        <div style="display: flex; align-items: center; margin-top: 3px;">
          <div style="background: #1f95ff; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px;"></div>
          <div>Total emails: <span style="font-weight: bold">${totalCount}</span></div>
        </div>
      </div>
    `;
  }

  function formatLinkTooltip(d) {
    const count = d.properties?.count || 1;
    let source = typeof d.source === 'object' ? d.source.properties.emailAdd : d.source;
    let target = typeof d.target === 'object' ? d.target.properties.emailAdd : d.target;
    
    let content = `
      <div class="tooltip-header" style="font-weight: bold; border-bottom: 1px solid #eaeaea; margin-bottom: 8px; padding-bottom: 5px;">
        Email Connection
        <span class="tooltip-close-btn" style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 18px; color: #999;">&times;</span>
      </div>
      <div class="tooltip-content">
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: #666;">From:</div>
          <div style="font-weight: bold;">${source}</div>
        </div>
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: #666;">To:</div>
          <div style="font-weight: bold;">${target}</div>
        </div>
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: #666;">Total Emails:</div>
          <div style="font-weight: bold;">${count}</div>
        </div>
    `;
    
    // Add details for all original connections
    if (d.properties?.details && d.properties.details.length > 0) {
      content += `
        <div style="margin-top: 12px; border-top: 1px solid #eaeaea; padding-top: 8px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Email Subjects:</div>
      `;
      
      // Create a map to count occurrences of each subject
      const subjectCounts = {};
      // Process only the current link's details, not all links
      d.properties.details.forEach(detail => {
        const subject = detail.subject || '[Missing subject]';
        subjectCounts[subject] = (subjectCounts[subject] || 0) + (detail.count || 1);
      });
      
      // Convert the map to an array of entries and sort by count (descending)
      const sortedSubjects = Object.entries(subjectCounts)
        .sort((a, b) => b[1] - a[1]);
      
      // Create a scrollable container if there are many subjects
      if (sortedSubjects.length > 10) {
        content += `<div style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 5px; margin-bottom: 5px;">`;
      }
      
      sortedSubjects.forEach(([subject, subjectCount], index) => {
        content += `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; ${index < sortedSubjects.length - 1 ? 'border-bottom: 1px dotted #eee; padding-bottom: 3px;' : ''}">
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${subject}">${subject}</div>
            <div style="margin-left: 10px; color: #666;">(${subjectCount})</div>
          </div>
        `;
      });
      
      // Close the scrollable container if it was created
      if (sortedSubjects.length > 10) {
        content += `</div>`;
      }
      
      content += `</div>`;
    }
    
    content += `</div>`;
    return content;
  }
  

  // Render graph visualization
  function render(data, options = {}) {
    console.log("Visualization render called");

    console.log("data: ", data);
    if (!svg || !data || !data.nodes || !data.links) {
      console.error("Cannot render: missing svg or data");
      return;
    }

    // Store original data
    graphData = data;
    visualOptions = { ...defaultOptions, ...options };

    // Clear previous visualization
    zoomG.selectAll("*").remove();

    // Stop any existing simulation
    if (simulation) {
      simulation.stop();
    }

    try {
      // Create SVG groups - now using the zoomG as parent
      const g = zoomG;

      // Consolidate multiple edges between the same nodes
      const consolidatedLinks = {};
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        // Create a unique key for each node pair (order doesn't matter)
        const linkKey = [sourceId, targetId].sort().join('--');

        if (!consolidatedLinks[linkKey]) {
          // Create a new consolidated link
          consolidatedLinks[linkKey] = {
            source: link.source,
            target: link.target,
            type: link.type,
            properties: {
              count: link.properties?.count || 1,
              details: [{ 
                type: link.type, 
                count: link.properties?.count || 1,
                subject: link.properties?.subject,
                timestamp: link.properties?.timestamp
              }]              
            }
          };
        } else {
          // Add count to existing link
          consolidatedLinks[linkKey].properties.count += (link.properties?.count || 1);          
          // Store details of this specific connection
          consolidatedLinks[linkKey].properties.details.push({ 
            type: link.type, 
            subject: link.properties?.subject, 
            count: link.properties?.count || 1,
            timestamp: link.properties?.timestamp
          });
        }
      });
      
      // Convert back to array
      const consolidatedLinksArray = Object.values(consolidatedLinks);

      // Calculate edge thickness scale based on consolidated counts
      const edgeCounts = consolidatedLinksArray.map(link => link.properties?.count || 1);
      const minCount = Math.min(...edgeCounts);
      const maxCount = Math.max(...edgeCounts);
      
      // Create color scale for edges based on counts - store in module scope
      edgeColorScale = d3.scaleSequential()
        .domain([minCount, maxCount])
        .interpolator(d3.interpolateRgb("#dfdfdf", "#d62728"));
      
      // Scale for edge thickness - store in module scope
      strokeWidthScale = d3.scaleLinear()
        .domain([minCount, maxCount])
        .range([1.5, 8]);
      
      // Sample points for the color gradient legend
      const colorSamples = 5;
      const edgeLegendItems = [];
      
      for (let i = 0; i < colorSamples; i++) {
        const value = minCount + (maxCount - minCount) * (i / (colorSamples - 1));
        edgeLegendItems.push({
          label: i === 0 ? "Few emails" : i === colorSamples - 1 ? "Many emails" : "",
          color: edgeColorScale(value),
          thickness: strokeWidthScale(value),
        });
      }
      
      // Create legend data
      const legendData = [
        {label: "Person", color: "#1f95ff", type: "circle", info: "Size indicates email volume"},
        ...edgeLegendItems
      ];

      // Create a new simulation
      simulation = d3
        .forceSimulation(data.nodes)
        .force(
          "link",
          d3
            .forceLink(consolidatedLinksArray)
            .id((d) => d.id)
            .distance(400)
        )
        .force("charge", d3.forceManyBody().strength(-400))
        .force(
          "center",
          d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        );

      // Create links with consolidated data
      const link = g
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(consolidatedLinksArray)
        .enter()
        .append("g");

      // Remove any existing legend
      svg.selectAll(".legend").remove();
      
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(20, 20)`);

      // Create more informative legend items
      const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => {
          // Group edge legend items in a compact way
          if (d.type === "line" && i > 1) {
            return `translate(${25 + (i-1)*25}, ${30})`;
          }
          return `translate(0, ${i === 0 ? 0 : 30*i})`;
        });
      
      // Add appropriate shape for each legend item
      legendItems.each(function(d) {
        const item = d3.select(this);
        if (d.type === "circle") {
          item.append("circle")
            .attr("cx", 9)
            .attr("cy", 9)
            .attr("r", 9)
            .attr("fill", d.color);
        } else {
          item.append("line")
            .attr("x1", 0)
            .attr("y1", 9)
            .attr("x2", 18)
            .attr("y2", 9)
            .attr("stroke", d.color)
            .attr("stroke-width", d.thickness || 4);
        }
      });
      
      // Add label text
      legendItems.append("text")
        .attr("x", d => d.type === "line" && d.label ? -5 : 25)
        .attr("y", d => d.type === "line" && d.label ? 25 : 13)
        .attr("text-anchor", d => d.type === "line" && d.label ? "middle" : "start")
        .text(d => d.label)
        .style("font-size", "10px") 
        .style("fill", "#333");
      
      // Add explanation text (only for items with info)
      legendItems.filter(d => d.info)
        .append("text")
        .attr("x", 25)
        .attr("y", 26)
        .text(d => d.info)
        .style("font-size", "10px")
        .style("fill", "#666")
        .style("font-style", "italic");

      link.append("line")
        .attr("stroke", d => edgeColorScale(d.properties?.count || 1))
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", d => strokeWidthScale(d.properties?.count || 1))
        .attr("cursor", "pointer"); // Add pointer cursor to indicate clickability

      // Add relationship labels if enabled
      if (visualOptions.showRelationships) {
        link.append("text")
          .attr("dy", "-0.3em")
          .attr("text-anchor", "middle")
          .text(d => {
            const count = d.properties?.count || 1;
            return `(${count})`;
          })
          .style("font-size", "10px")
          .style("fill", "#555");
      }

      // Calculate total count for each node based on its adjacent edges
      const nodeTotalCounts = {};
      data.nodes.forEach(node => {
        // Initialize counts
        nodeTotalCounts[node.id] = 0;
      });
      
      // Sum up counts from all adjacent edges using consolidated links
      consolidatedLinksArray.forEach(link => {
        const count = link.properties?.count || 1;
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        nodeTotalCounts[sourceId] += count;
        nodeTotalCounts[targetId] += count;
      });
      
      // Find min and max counts for scaling
      const nodeCountValues = Object.values(nodeTotalCounts);
      const minNodeCount = Math.max(1, Math.min(...nodeCountValues));
      const maxNodeCount = Math.max(...nodeCountValues);
      
      // Create scale function for node radius
      const baseRadius = (() => {
        switch (visualOptions.nodeSize) {
          case "small": return 5;
          case "medium": return 10;
          case "large": return 15;
          default: return 10;
        }
      })();
      
      // Scale radius between baseRadius and baseRadius*3 based on edge counts
      const radiusScale = d3.scaleSqrt()
        .domain([minNodeCount, maxNodeCount])
        .range([baseRadius, baseRadius * 3]);
      
      // Create nodes
      const node = g
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter()
        .append("g");
      
      // Append the circle to each group with dynamic radius
      node.append("circle")
        .attr("r", d => radiusScale(nodeTotalCounts[d.id]))
        .attr("fill", d => {
          //NODE COLORS
          if (d.labels && d.labels.includes("Person")) return "#1f95ff"; 
          return "#888";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    
      // Append the label to each group
      if(visualOptions.showLabels){
        node.append("text")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(d => {
            if (d.labels && d.labels.includes("Person")) return d.properties.emailAdd; 
            return d.id;
          })
          .style("font-size", "10px")
          .style("fill", "#333");
      }

      // Handle node tooltips - Using clientX/clientY for more reliable positioning
      node
        .on("mouseover", function(event, d) {
          const totalCount = nodeTotalCounts[d.id];
          showNodeTooltip(formatNodeTooltip(d, totalCount), event.clientX, event.clientY);
        })
        .on("mousemove", function(event) {
          // Get container's position
          const container = document.querySelector("#visualization");
          const rect = container.getBoundingClientRect();
          
          // Calculate position relative to the container
          const leftPos = event.clientX - rect.left;
          const topPos = event.clientY - rect.top;
          
          // Update tooltip position in real-time with cursor movement
          nodeTooltip
            .style("left", leftPos + "px")
            .style("top", topPos + "px");
        })
        .on("mouseout", function() {
          hideNodeTooltip();
        });

      // Handle link interactions (hover and click)
      link
        .on("mouseover", function(event, d) {
          // Enlarge the link on hover
          d3.select(this).select("line")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", d => strokeWidthScale(d.properties?.count || 1) * 1.5);
        })
        .on("mouseout", function(event, d) {
          // Reset the link appearance unless it's the selected link
          if (this !== selectedLink) {
            d3.select(this).select("line")
              .attr("stroke-opacity", 0.8)
              .attr("stroke-width", d => strokeWidthScale(d.properties?.count || 1));
          }
        })
        .on("click", function(event, d) {
          // If this link is already selected, deselect it
          if (this === selectedLink) {
            unselectLink();
            hideTooltip();
          } else {
            // If another link was selected, reset its appearance
            unselectLink();
            
            // Set this link as the selected one
            selectedLink = this;
            
            // Highlight this link
            d3.select(this).select("line")
              .attr("stroke-opacity", 1)
              .attr("stroke-width", d => strokeWidthScale(d.properties?.count || 1) * 2)
              .attr("stroke", "#74A662"); // Highlight color
            
            // Show tooltip for this link
            showTooltip(formatLinkTooltip(d));
          }
          
          // Prevent event from propagating to the SVG
          event.stopPropagation();
        });

      // Add click handler to the SVG to deselect when clicking empty space
      svg.on("click", function() {
        hideTooltip();
        unselectLink();
      });

      // Add drag behavior directly to nodes
      node.call(
        d3.drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

      // Define drag event handlers with direct reference to simulation
      function dragStarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragEnded(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      // Update positions on each tick
      simulation.on("tick", () => {
        link.select("line")
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
      
        link.select("text")
          .attr("x", d => (d.source.x + d.target.x) / 2)
          .attr("y", d => (d.source.y + d.target.y) / 2);
      
        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
      });

      console.log("Visualization rendered successfully");
    } catch (error) {
      console.error("Error rendering visualization:", error);
    }
  }

  // Clear visualization
  function clear() {
    if (zoomG) {
      zoomG.selectAll("*").remove();
    }

    if (simulation) {
      simulation.stop();
    }
    
    // Reset selected link
    selectedLink = null;
    
    // Also clear tooltips
    if (tooltip) {
      hideTooltip();
    }
    
    if (nodeTooltip) {
      hideNodeTooltip();
    }
  }

  // Return public API
  return {
    init,
    render,
    clear,
    updateDimensions,
  };
})();