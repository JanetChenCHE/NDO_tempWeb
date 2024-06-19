class STACKEDBARCHART {
  //constructor

  //method
  loadStackedBarChart(data, id) {
    // Transpose data
    const transposedData = data.slice(1).map(d => d.slice(1));

    // Dimensions
    const document_id = id.replace('#', '');
    const container = document.getElementById(document_id);
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
          width = container.clientWidth - margin.left - margin.right,
          height = 340 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select(id)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 100) // Additional space for the legend
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data[0].slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.slice(1).map(d => (d[0]));

    // Custom color palette with more than 20 colors
    // const customColors = [
    //     "#262759", "#28316e", "#2a3c83", "#2c4798", "#2e52ad",
    //     "#305dc2", "#3268d7", "#3473ec", "#6a74a5", "#a67c5e",
    //     "#d18417", "#e8931f", "#f29f3e", "#f4aa53", "#f6b568",
    //     "#f8c07d", "#facb92", "#fdd6a7", "#ffdfbc", "#ffe9d1"
    // ];

  //   const customColors = [
  //     "#262759", "#ffe9d1", "#2a3c83", "#fdd6a7", "#2e52ad",
  //     "#f8c07d", "#3268d7", "#f4aa53", "#6a74a5", "#e8931f",
  //     "#a67c5e", "#e8931f", "#3473ec", "#f4aa53", "#305dc2",
  //     "#f8c07d", "#2c4798", "#fdd6a7", "#28316e", "#ffe9d1"
  // ];

//   const customColors = [
//     "#262759", "#ff9c20", "#262759", "#ff9c20", "#262759",
//     "#ff9c20", "#262759", "#ff9c20", "#262759", "#ff9c20",
//     "#262759", "#ff9c20", "#262759", "#ff9c20", "#262759",
//     "#ff9c20", "#262759", "#ff9c20", "#262759", "#ff9c20"
// ];

    const customColors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
      "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
      "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
    ];

    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(customColors);

    // Stack the data
    const keys = Array.from({ length: data[0].length - 1 }, (_, i) => i);
    const stackedData = d3.stack()
      .keys(keys)
      (transposedData);
      
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
    
    // Calculate the maximum value from the stacked data
    const maxDataValue = d3.max(stackedData, stackedGroup => d3.max(stackedGroup, d => d[1]));

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([0, Math.max(24, maxDataValue)])  // Set the domain from 0 to the larger of 24 or maxDataValue
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

    // Create a tooltip
    const tooltip = d3.select(id)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    // Three functions that change the tooltip when user hover / move / leave a cell
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

    // Show the bars with tooltips
    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
        .attr("fill", d => color(subgroups[d.key]))  // Use subgroups to map colors correctly
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", (d, i) => x(data[i + 1][0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

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


  deleteStackedBarChart(id_eng, id_squ) {
    // Remove existing chart if any
    d3.select(id_eng + ' svg').remove();
    d3.select(id_squ + ' svg').remove();
  }
}

export { STACKEDBARCHART };