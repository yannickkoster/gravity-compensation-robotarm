class Slider {
  constructor(ID, DATA, SLIDER_WIDTH, DEFAULT, FORMAT, UNITS) {
    // Replace all spaces with underscores in the CSS ID, else it breaks
    this.CSS_ID = ID.replace(/ /g, '_').toLowerCase();
    // Data
    this.min = d3.min(DATA);
    this.max = d3.max(DATA);
    this.range = this.max - this.min;
    this.value = DEFAULT;
    // Slider number formatting
    this.format = FORMAT;
    this.units = UNITS;

    /* Dimensions */
    // Handle
    this.handle_radius = 10;
    const HANDLE_PADDING = 4;
    const HANDLE_R = (this.handle_radius + HANDLE_PADDING);
    // Bar
    const RECT_HEIGHT = this.handle_radius/2;
    // Slider
    this.slider_width = SLIDER_WIDTH;
    const CONTAINER_WIDTH = this.slider_width + 2*HANDLE_R;
    const CONTAINER_HEIGHT = 2*(2*HANDLE_R);
    this.slider_x_offset = HANDLE_R;
    const SLIDER_Y_OFFSET = 0;

    // Functions for scaling between slider values and pixel coordinates
    this.num2px = d3.scaleLinear()
      .domain([this.min, this.max])
      .range([ this.slider_x_offset, this.slider_x_offset + this.slider_width ]);
    this.px2num = d3.scaleLinear()
      .domain([ this.slider_x_offset, this.slider_x_offset + this.slider_width ])
      .range([this.min, this.max]);

    // Create the SVG slider
    const CONTAINER = d3.select("body")
      .selectAll("#slider-container_" + this.CSS_ID)
      .data(["slider-container_" + this.CSS_ID])
      .enter()
      .append("svg")
      .attr("id", function(d){ return d; })
      .attr("width", CONTAINER_WIDTH)
      .attr("height", CONTAINER_HEIGHT);

    // Create a textbox for displaying the slider value and write the value to it
    const TEXT = CONTAINER.append("text")
      .attr("dominant-baseline", "middle")
    TEXT.append("tspan")
      .attr("id", "slider-name-container_" + this.CSS_ID)
      .attr("x", this.slider_x_offset)
      .attr("y", CONTAINER_HEIGHT/4)
      .attr("style", "font-family: Helvetica, Arial, sans-serif;")
      // .attr("text-anchor", "start")
      .text(ID);
    TEXT.append("tspan")
      .attr("id", "slider-value_" + this.CSS_ID)
      .attr("x", CONTAINER_WIDTH - this.slider_x_offset)
      .attr("y", CONTAINER_HEIGHT/4)
      .attr("style", "font-family: Helvetica, Arial, sans-serif;")
      .attr("text-anchor", "end")
      .text(this.write_value(this.value));

    // Create the slider bar
    const BAR_X = this.slider_x_offset
    const BAR_Y = CONTAINER_HEIGHT - (HANDLE_R + RECT_HEIGHT/2)
    const BAR_HEIGHT = RECT_HEIGHT
    CONTAINER.append("rect")
        .attr("style", "fill: #007fff;")
        .attr("id", "slider-left_" + this.CSS_ID)
        .attr("width", this.slider_left_width(this.value))
        .attr("height", BAR_HEIGHT)
        .attr('x', BAR_X)
        .attr('y', BAR_Y)
        .attr("rx", 2)
        .attr("ry", 2);
    CONTAINER.append("rect")
        .attr("style", "fill: #c0c0c0;")
        .attr("id", "slider-right_" + this.CSS_ID)
        .attr("width", this.slider_right_width(this.value))
        .attr("height", BAR_HEIGHT)
        .attr('x', this.slider_right_x(this.value))
        .attr('y', BAR_Y)
        .attr("rx", 2)
        .attr("ry", 2);
    // Create the handle
    const HANDLE_X = this.num2px(this.value)
    const HANDLE_Y = CONTAINER_HEIGHT - HANDLE_R
    CONTAINER.append("circle")
        .attr("id", "slider-handle_" + this.CSS_ID)
        .attr("cx", HANDLE_X)
        .attr("cy", HANDLE_Y)
        .attr("r", this.handle_radius)
        .attr("style", function() {
          var str = "-webkit-filter: drop-shadow( 0px 2px 1px rgba(0, 0, 0, .5));"
          str += ' '
          str += "filter: drop-shadow( 0px 2px 1px rgba(0, 0, 0, .5));"
          str += ' '
          str += "fill: white;"
          str += ' '
          str += "stroke: grey;"
          str += ' '
          str += "stroke-width: .1;"
          return str;
        })
        .call(d3.drag(this) // N.B. the => notation is necessary so that the reference to 'this' in the functions is maintained
            .on("start", () => this.dragstarted())
            .on("drag", (event, d) => this.dragged(event, d))
            .on("end", () => this.dragended()))
        .on("click", (event, d) => this.clicked(event, d));
  }
  write_value(value) {
    // Write number to text box
    return d3.format(this.format)(value) + this.units;
  }
  slider_left_width(x) {
    // Adjust the size of the left-rectangle of the slider
    return this.num2px(x) - this.slider_x_offset;
  }
  slider_right_width(x) {
    // Adjust the size of the right-rectangle of the slider
    return (this.slider_width - this.num2px(x)) + this.slider_x_offset
  }
  slider_right_x(x) {
    // Adjust the starting position of the right-rectangle of the slider to
    // match the handle position
    return this.num2px(x);
  }
  /*
    Define the handle animations
  */
  clicked(event, d) {
    // Dragged
    if (event.defaultPrevented) return;
    // Otherwise clicked
    d3.select(this).transition()
        .attr("r", 1.1*this.handle_radius)
      .transition()
        .attr("r", this.handle_radius);
  }
  dragstarted() {
    d3.select("#slider-handle_" + this.CSS_ID).transition()
        .attr("r", this.handle_radius)
      .transition()
        .attr("r", 1.1*this.handle_radius);
  }
  dragged(event, d) {
    this.value = this.clamp(this.px2num(event.x), this.min, this.max);
    d3.select("#slider-handle_" + this.CSS_ID)
      .attr("cx", this.num2px(this.value));
    d3.select("#slider-left_" + this.CSS_ID)
      .attr("width", this.slider_left_width(this.value));
    d3.select("#slider-right_" + this.CSS_ID)
      .attr("x", this.slider_right_x(this.value))
      .attr("width", this.slider_right_width(this.value));
    d3.select("#slider-value_" + this.CSS_ID)
        .text(this.write_value(this.value));
  }
  dragended() {
    d3.select("#slider-handle_" + this.CSS_ID).transition()
        .attr("r", 1.1*this.handle_radius)
      .transition()
        .attr("r", this.handle_radius);
  }
  /*
    Math functions
  */
  clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
  }
}
