class STACKEDBARCHART_TEACHER {
    //constructor

    // methods
    loadStackedBarChart(data, id) {
      // Transpose data
      const transposedData = data.slice(1).map(d => d.slice(1));
    
      // Dimensions
      const document_id = id.replace('#', '');
      const container = document.getElementById(document_id);
      const margin = {top: 30, right: 30, bottom: 30, left: 50},
      width = container.clientWidth - margin.left - margin.right,
      height = 340 - margin.top - margin.bottom;
    
      // append the svg object to the body of the page
      const svg = d3.select(id)
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
    
      // List of subgroups = header of the csv files = soil condition here
      const subgroups = data[0].slice(1);
    
      // List of groups = species here = value of the first column called group -> I show them on the X axis
      const groups = data.slice(1).map(d => (d[0]));
    
      // Add X axis
      const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');
    
      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 25])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
      // Color palette = one color per subgroup
      const customColors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
        "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
        "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
      ];
  
      const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(customColors);
    
      // Stack the data? --> stack per subgroup
      const keys = Array.from({ length: data[0].length - 1 }, (_, i) => i);
      const stackedData = d3.stack()
        .keys(keys)
        (transposedData);
        

        //========================================================================================================
      // Create tooltip
      const tooltip = d3.select('#stacked_bar_chart_teacher')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px');
    
      // Define functions for tooltip
        //THREE function - change tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
          const subgroupIndex = d3.select(this.parentNode).datum().key;
          const subgroupName = subgroups[subgroupIndex];
          const subgroupValue = d.data[subgroupIndex];
          tooltip
              .html(subgroupName + ": " + subgroupValue)
              .style("opacity", 1);
        }
        const mousemove = function(event, d) {
          tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY) + "px");
        }
        const mouseleave = function(event, d) {
          tooltip.style("opacity", 0);
        }
      //========================================================================================================

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
          .attr("fill", d => color(subgroups[d.key]))
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(d => d)
          .join("rect")
            .attr("x", (d, i) => x(data[i + 1][0]))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width",x.bandwidth())
            //tooltip
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        // Calculate legend properties
    const legendSpacing = 70;
    const legendItemHeight = 20;
    const legendWidth = subgroups.length * legendSpacing;
    const itemsPerRow = Math.floor(width / legendSpacing);
    const numberOfRows = Math.ceil(subgroups.length / itemsPerRow);

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${(width - itemsPerRow * legendSpacing) / 2},${height + 40})`);

    const legendItem = legend.selectAll(".legend-item")
      .data(subgroups)
      .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${(i % itemsPerRow) * legendSpacing}, ${Math.floor(i / itemsPerRow) * legendItemHeight + 20})`);

    legendItem.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => color(d)); // Corrected color assignment

    legendItem.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .text(d => d)
      .attr("fill", d => color(d))
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("font-size", "13px"); // Reduce font size


    }
    
    deleteStackedBarChart_teacher(id) {
        // Remove existing chart if any
        d3.select(id + ' svg').remove();
    }
}
export { STACKEDBARCHART_TEACHER };