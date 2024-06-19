class LINECHART_TEACHER {
    // constructor

    // method
    loadLineChart(data1, data2){
        this.deleteLineChart();
        // Set the dimensions and margins of the graph
        const container = document.getElementById('line_chart_teacher');
        const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = container.clientWidth - margin.left - margin.right,
        height = 340 - margin.top - margin.bottom;

        // Append the SVG object to the body of the page
        const svg = d3.select('#line_chart_teacher')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // data1 Extraction
        // Get the month names and OS values
        const months = data1.map(entry => entry[0]);
        const OS = data1.map(entry => entry[1].OS); // Assuming OS is always the first value
        const OS2 = data2.map(entry => entry[1].OS);

        // Add x-axis
        const x = d3.scaleBand()
            .domain(months)
            .range([0, width]);
        
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        // Add y-axis
        const y = d3.scaleLinear()
            .domain([0, 6]) // Adjust the domain based on OS data1
            .range([height, 0]);
        
        svg.append('g')
            .call(d3.axisLeft(y));

        // Add the line (OS)
        svg.append('path')
            .datum(OS)
            .attr('fill', 'none')
            .attr('stroke', '#262759')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x((d, i) => x(months[i]) + x.bandwidth() / 2) // Use month as x-coordinate
                .y(d => y(d))
            );

        // Add the line (OS2)
        svg.append('path')
        .datum(OS2)
        .attr('fill', 'none')
        .attr('stroke', '#ff9c20')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x((d, i) => x(months[i]) + x.bandwidth() / 2) // Use month as x-coordinate
            .y(d => y(d))
        );
    }

    loadLineChart_selectedCohort(data){
        // Set the dimensions and margins of the graph
        const container = document.getElementById('line_chart_teacher_selectedCohort');
        const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = container.clientWidth - margin.left - margin.right,
        height = 340 - margin.top - margin.bottom;

        // Append the SVG object to the body of the page
        const svg = d3.select('#line_chart_teacher_selectedCohort')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // data Extraction
        // Get the month names and OS values
        const months = data.map(entry => entry[0]);
        const OS = data.map(entry => entry[1].OS) // Assuming OS is always the first value
                                    .filter(d => !isNaN(d));

        // Add x-axis
        const x = d3.scaleBand()
            .domain(months)
            .range([0, width]);
        
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        // Add y-axis
        const y = d3.scaleLinear()
            .domain([0, 6]) // Adjust the domain based on OS data
            .range([height, 0]);
        
        svg.append('g')
            .call(d3.axisLeft(y));

        // Create tooltip
        const tooltip = d3.select('#line_chart_teacher_selectedCohort')
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('position', 'absolute')
            .style('z-index', '10');
    
        // Tooltip functions
        const mouseover = (event, d) => {
            tooltip.html('Value: ' + d)
                .style('opacity', 1);
        };
        
        const mousemove = (event, d) => {
            const tooltipX = event.pageX + 10;
            const tooltipY = event.pageY - 30;
            tooltip.style('transform', 'translateY(-55%)')
                .style('left', tooltipX + 'px')
                .style('top', tooltipY + 'px');
        };
        const mouseleave = (event, d) => {
            tooltip.style('opacity', 0);
        };

        // Add the line (OS)
        svg.append('path')
            .datum(OS)
            .attr('fill', 'none')
            .attr('stroke', '#262759')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x((d, i) => x(months[i]) + x.bandwidth() / 2) // Use month as x-coordinate
                .y(d => y(d))
            );

            // Add the point (OS)
            svg.append('g')
            .selectAll('circle')
            .data(OS)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => x(months[i]) + x.bandwidth() / 2)
            .attr('cy', d => y(d))
            .attr("r", 5)
            .attr("stroke", "#ff9c20")
            .attr("stroke-width", 2)
            .attr("fill", "white")
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);
                
        }

    // Method to delete the existing chart
    deleteLineChart(){
        d3.select('#line_chart_teacher svg').remove();
        d3.select('#line_chart_teacher_selectedCohort svg').remove();
        // d3.select("#line_chart_teacher").selectAll("*").remove();
    }
}

// Export
export { LINECHART_TEACHER };
