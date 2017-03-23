var width = 720,
    height = 720,
    outerRadius = Math.min(width, height) / 2 - 10,
    innerRadius = outerRadius - 24;

var formatPercent = d3.format(".1%");

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var layout = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

var path = d3.svg.chord()
    .radius(innerRadius);

var svg = d3.selectAll(".chord-diagram-main").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.append("circle")
    .attr("r", outerRadius);

var genresGlobal = null;
var selectedGenreIndex = null;

function changeDataYear(year) {
    // Remove existing groups and chords
    svg.selectAll(".group").remove();
    svg.selectAll(".chord").remove();

    genresFilePath = "data/genres" + year.toString() + ".csv"
    matrixFilePath = "data/matrix" + year.toString() + ".json"
    queue()
        .defer(d3.csv, genresFilePath)
        .defer(d3.json, matrixFilePath)
        .await(makeChordDiagram);
}

function makeChordDiagram(error, genres, matrix) {
  if (error) throw error;
  genresGlobal = genres;

  // Compute the chord layout.
  layout.matrix(matrix);

  // Add a group per neighborhood.
  var group = svg.selectAll(".group")
      .data(layout.groups)
    .enter().append("g")
      .attr("class", "group")
      .on("mouseover", mouseover);

  var totalSongs = 0
  for (var i = 0; i < matrix.length; i++) {
      totalSongs = totalSongs + matrix[i][i]
  }

  // Add a mouseover title.
  group.append("title").text(function(d, i) {
    return genres[i].name + ": " + formatPercent(matrix[i][i]/totalSongs) + " of all songs";
  });

  // // Add a tooltip
  // group.append("a")
  //       .attr("data-toggle", "tooltip")
  //       .attr("data-placement", "top")
  //       .attr("title", function(d, i) {
  //           return genres[i].name + ": " + formatPercent(matrix[i][i]/totalSongs) + " of all songs";
  //       });

  // Add the group arc.
  var groupPath = group.append("path")
      .attr("id", function(d, i) { return "group" + i; })
      .attr("d", arc)
      .style("fill", function(d, i) { return genres[i].color; });

  // Add a text label.
  var groupText = group.append("text")
      .attr("x", 6)
      .attr("dy", 15);

  groupText.append("textPath")
      .attr("xlink:href", function(d, i) { return "#group" + i; })
      .text(function(d, i) { return genres[i].name; });

  // Remove the labels that don't fit. :(
  groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
      .remove();

  // Add the chords.
  var chord = svg.selectAll(".chord")
      .data(layout.chords)
    .enter().append("path")
      .attr("class", "chord")
      .style("fill", function(d) { return genres[d.source.index].color; })
      .attr("d", path);

  // If genre was selected in chord diagram of previous decade,
  // then select that genre in the new chord diagram
  if (selectedGenreIndex != null) {
      setChordColors(selectedGenreIndex, chord);
      showSelectedGenreChords(selectedGenreIndex, chord);
  }

  function mouseover(d, i) {
    selectedGenreIndex = i;
    setChordColors(i, chord);
    showSelectedGenreChords(i, chord);
  }
}

function setChordColors(genreIndex, chord) {
    // Set chords to target colors
    chord.style("fill", function(p) {
        if (p.source.index == genreIndex || p.target.index == genreIndex) {
            if (genreIndex > p.source.index) {
                return genresGlobal[p.source.index].color
            } else {
                return genresGlobal[p.target.index].color;
            }
        }
    });
}

function showSelectedGenreChords(genreIndex, chord) {
    chord.classed("fade", function(p) {
      return p.source.index != genreIndex
          && p.target.index != genreIndex;
    });
}

function setSelectedGenreIndexToNull() {
    selectedGenreIndex = null;
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});
