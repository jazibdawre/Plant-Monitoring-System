var server_url = "http://192.168.0.103/"

$(document).ready(function () {
    if ($(".js-range-slider").length) {
        $(".js-range-slider").ionRangeSlider({
            type: "double",
            min: 0,
            max: 100,
            from: 0,
            to: 0,
            grid: true,
        });
    }
    
    $("#loginmodalButton").click(function () {
        $("#loginModal").modal('show');
    });

    $("#signupmodalButton").click(function () {
        $("#signupModal").modal('show');
    });
});

$(window).on('load', function() {
    axios.defaults.baseURL = this.server_url;
    var frequency = 300000;     //5 min:300000
    //var frequency = 10000;     //10 seconds
    get = function(uri) {
        try {
            return axios.get(uri)
            .then(function (response) {
                if (response.status==200){
                    return Object.assign([],response.data.data);
                }
                else {
                    console.log("Response: "+response.status+" "+response.statusText);
                    return new Error('Error '+response.status+' '+response.statusText);
                }
            })
            .catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log("Error "+error.response.status+" "+error.response.statusText+" Couldn't fetch data from server for"+uri);
                  console.log(error.config);
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                  return new Error('Error '+error.response);
                } else if (error.request) {
                  // The request was made but no response was received
                  // 'error.request' is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log("Server not responding for "+uri)
                  console.log(error.config);
                  console.log(error.request);
                  return new Error('Error '+error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log(error.config);
                  console.log('Error', error.message);
                  return new Error('Error '+error.response.status+' '+error.response.statusText);
                }
            });
        } catch (error) {
            console.log(error);
            return new Error('Error '+error);
        }
    }

    post = function(uri,body) {
        try {
            return axios.post(uri, body, {headers: { "Access-Control-Allow-Origin" : "*", "Content-Type": "application/json;charset=utf-8"}})
            .then(function (response) {
                if (response.status==200 | response.status==201){
                    return "Successful";
                }
                else {
                    console.log(response);
                    return "Successful";
                }
            })
            .catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  alert("Error "+error.response.status+" "+error.response.statusText+" couldn't complete your request");
                  console.log(error.config);
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                  return new Error('Error '+error.response);
                } else if (error.request) {
                  // The request was made but no response was received
                  // 'error.request' is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  alert("Server is not responding for "+uri);
                  console.log(error.request);
                  console.log(error.config);
                  return new Error('Error '+error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                  console.log(error.config);
                  return new Error('Error '+error.response.status+' '+error.response.statusText);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    $("#signinButton").click(function () {
        alert("Login is temporarily disabled");
    });

    $("#signupButton").click(function () {
        alert("Registration is temporarily disabled");
    });

    if (window.location.pathname != '/' && window.location.pathname != '/index.html' && window.location.pathname != '/actions.html' && window.location.pathname != '/about.html') {
        
        get("logs")
        .then(function(logs) {

            var sheetslogs = logs.reverse();
            var tot_current = ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"];
            var minimum = [0, 0, 0, 0, 0];
            var maximum = [100, 100, 100, 10, 100];
            var current;

            graph_data = function (data) {
                var graph_current = data;
                graph_current[3] = graph_current[3] * 10;
                return graph_current;
            }

            display_home = function() {
                if (tot_current[0] != "NA") {
                    if (tot_current[0] == "Good") {
                        $("#overallstatus").html('<div style="color: green;"><p><h3>Good</h3></p><p>All systems operational<br>All parameters are within limits</p></div>');
                    } else if (tot_current[0] == "Mild") {
                        $("#overallstatus").html('<div style="color: orange;"><p><h3>Mild Issue</h3></p><p>All systems operational<br>Some parameters are out of limits</p></div>');
                    } else if (tot_current[0] == "Bad") {
                        $("#overallstatus").html('<div style="color: red;"><p><h3>Major Issue</h3></p><p>All systems operational<br>Some parameters are out of limits</p></div>');
                    } else {
                        $("#overallstatus").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[0]+'</p></div>');
                    }
                    
                } else {
                    $("#overallstatus").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                }
    
                if (tot_current[4] != "NA") {
                    if (tot_current[4] >= minimum[0] && tot_current[4] <= maximum[0]) {
                        $("#temperature").html('<div style="color: green;"><p><h3>'+tot_current[4]+'°C</h3></p><p>Suitable Temperature</p></div>');
                    } else if (tot_current[4] < minimum[0]) {
                        $("#temperature").html('<div style="color: blue;"><p><h3>'+tot_current[4]+'°C</h3></p><p>Temperature Low</p></div>');
                    } else if (tot_current[4] > maximum[0]) {
                        $("#temperature").html('<div style="color: red;"><p><h3>'+tot_current[4]+'°C</h3></p><p>Temperature High</p></div>');
                    } else {
                        $("#temperature").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[4]+'</p></div>');
                    }
                    
                } else {
                    $("#temperature").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                }
    
                if (tot_current[5] != "NA") {
                    if (tot_current[5] >= minimum[1] && tot_current[5] <= maximum[1]) {
                        $("#humidity").html('<div style="color: green;"><p><h3>'+tot_current[5]+'%</h3></p><p>Perfect Humidity</p></div>');
                    } else if (tot_current[5] < minimum[1]) {
                        $("#humidity").html('<div style="color: red;"><p><h3>'+tot_current[5]+'%</h3></p><p>Humidity Low</p></div>');
                    } else if (tot_current[5] > maximum[1]) {
                        $("#humidity").html('<div style="color: orange;"><p><h3>'+tot_current[5]+'%</h3></p><p>Humidity High</p></div>');
                    } else {
                        $("#humidity").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[5]+'</p></div>');
                    }
                    
                } else {
                    $("#humidity").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                } 
    
                if (tot_current[6] != "NA") {
                    if (tot_current[6] >= minimum[2] && tot_current[6] <= maximum[2]) {
                        $("#moisture").html('<div style="color: green;"><p><h3>'+tot_current[6]+'%</h3></p><p>Happy Soil</p></div>');
                    } else if (tot_current[6] < minimum[2]) {
                        $("#moisture").html('<div style="color: red;"><p><h3>'+tot_current[6]+'%</h3></p><p>Dry Soil</p></div>');
                    } else if (tot_current[6] > maximum[2]) {
                        $("#moisture").html('<div style="color: orange;"><p><h3>'+tot_current[6]+'%</h3></p><p>Wet Soil</p></div>');
                    } else {
                        $("#moisture").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[6]+'</p></div>');
                    }
                    
                } else {
                    $("#moisture").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                } 
    
                if (tot_current[7] != "NA") {
                    if (tot_current[7] >= minimum[3] && tot_current[7] <= maximum[3]) {
                        $("#sunlight").html('<div style="color: green;"><p><h3>'+tot_current[7]+' hours</h3></p><p>Sunny Day</p></div>');
                    } else if (tot_current[7] < minimum[3]) {
                        $("#sunlight").html('<div style="color: blue;"><p><h3>'+tot_current[7]+' hours</h3></p><p>Overcast</p></div>');
                    } else if (tot_current[7] > maximum[3]) {
                        $("#sunlight").html('<div style="color: red;"><p><h3>'+tot_current[7]+' hours</h3></p><p>Too much Sunlight</p></div>');
                    } else {
                        $("#sunlight").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[7]+'</p></div>');
                    }
                    
                } else {
                    $("#sunlight").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                } 
    
                if (tot_current[8] != "NA") {
                    if (tot_current[8] >= minimum[4] && tot_current[8] <= maximum[4]) {
                        $("#waterlevel").html('<div style="color: green;"><p><h3>'+tot_current[8]+'%</h3></p><p>Water Level Ok</p></div>');
                    } else if (tot_current[8] < minimum[4]) {
                        $("#waterlevel").html('<div style="color: red;"><p><h3>'+tot_current[8]+'%</h3></p><p>Water Level Low</p></div>');
                    } else if (tot_current[8] > maximum[4]) {
                        $("#waterlevel").html('<div style="color: blue;"><p><h3>'+tot_current[8]+'%</h3></p><p>Water Level High</p></div>');
                    } else {
                        $("#waterlevel").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[8]+'</p></div>');
                    }
                    
                } else {
                    $("#waterlevel").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                }
    
                if (tot_current[1] != "NA") {
                    if (tot_current[1] == "Idle") {
                        $("#waterpump").html('<div style="color: green;"><p><h3>'+tot_current[1]+'</h3></p><p>Switched Off</p></div>');
                    } else if (tot_current[1] == "Active") {
                        $("#waterpump").html('<div style="color: orange;"><p><h3>'+tot_current[1]+'</h3></p><p>Switched On</p></div>');
                    } else {
                        $("#waterpump").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+tot_current[0]+'</p></div>');
                    }
                    
                } else {
                    $("#waterpump").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
                }
            }
            display_home();
            
            get("latest")
            .then(function(latest) {
                tot_current = latest;
                get("limits")
                .then(function(limits) {
                    minimum = limits[0];
                    maximum = limits[1];
                    if ($("#overall_graph").length) {
                        overall_graph.series[0].setData(graph_data(limits[0]), true);
                        overall_graph.series[1].setData(graph_data(limits[1]), true);
                        overall_graph.series[2].setData(graph_data(sheetslogs[0].slice(1)), true);
                    }
                    display_home();
                }, function (err) {this.console.log(err);})
                .catch(function(error) {
                    this.console.log(error);
                });
            }, function(err) {this.console.log(err);})
            .catch(function(error) {
                this.console.log(error);
            });
        
            this.setInterval(function () {
                get("latest")
                .then(function(latest) {
                    tot_current = latest;
                    display_home();
                    if (latest[3] != sheetslogs[0][0]) {
                        var time = (new Date(latest[3])).getTime();
                        sheetslogs.unshift(latest.slice(3));
                        current = sheetslogs[0].slice(1);
                        if ($("#overall_graph").length) {
                            overall_graph.series[2].setData(graph_data(current), true);
                        }
                        if ($("#temperature_graph").length) {
                            temperature_graph.series[0].addPoint([time, latest[4]], true, true);
                        }
                        if ($("#humidity_graph").length) {
                            humidity_graph.series[0].addPoint([time, latest[5]], true, true);
                        }
                        if ($("#moisture_graph").length) {
                            moisture_graph.series[0].addPoint([time, latest[6]], true, true);
                        }
                        if ($("#sunlight_graph").length) {
                            sunlight_graph.series[0].addPoint([time, latest[7]], true, true);
                        }
                        if ($("#waterlevel_graph").length) {
                            waterlevel_graph.series[0].addPoint([time, latest[8]], true, true);
                        }
                        
                    }
                }, function(err) {this.console.log(err);})
                .catch(function(error) {
                    this.console.log(error);
                });
            }, frequency);

            if ($("#spreadsheet").length) {
                var container = document.getElementById('spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Temperature (°C) ", " Humidity (%) ", " Moisture (%) ", " Sunlight (hours) ", " Water Level (%) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }
    
            $("#downloadlogsButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Server Logs"});
            });

            if ($("#temperature_spreadsheet").length) {
                var container = document.getElementById('temperature_spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Temperature (°C) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                columns: [
                  {data: 0},
                  {data: 1}
                ],
                fixedColumnsLeft: 1,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }

            $("#temperaturedownloadButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Temperature Logs"});
            });
        
            if ($("#humidity_spreadsheet").length) {
                
                var container = document.getElementById('humidity_spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Humidity (%) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                columns: [
                  {data: 0},
                  {data: 2}
                ],
                fixedColumnsLeft: 1,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }

            $("#humiditydownloadButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Humidity Logs"});
            });
        
            if ($("#moisture_spreadsheet").length) {
                
                var container = document.getElementById('moisture_spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Moisture (%) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                columns: [
                  {data: 0},
                  {data: 3}
                ],
                fixedColumnsLeft: 1,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }

            $("#moisturedownloadButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Moisture Logs"});
            });
        
            if ($("#sunlight_spreadsheet").length) {
                
                var container = document.getElementById('sunlight_spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Sunlight (hours) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                columns: [
                  {data: 0},
                  {data: 4}
                ],
                fixedColumnsLeft: 1,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }

            $("#sunlightdownloadButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Sunlight Logs"});
            });
        
            if ($("#waterlevel_spreadsheet").length) {
                
                var container = document.getElementById('waterlevel_spreadsheet');
                var sheet = new Handsontable(container, {
                data: sheetslogs,
                rowHeaders: true,
                colHeaders: ["", " Water Level (%) "],
                width: '100%',
                height: '100%',
                stretchH: 'all',
                observeChanges: true,
                exportFile: true,
                columns: [
                  {data: 0},
                  {data: 5}
                ],
                fixedColumnsLeft: 1,
                licenseKey: 'non-commercial-and-evaluation'
                });
            }

            $("#waterleveldownloadButton").click(function () {
                sheet.getPlugin("exportFile").downloadFile("csv", {filename: "PMS Water Level Logs"});
            });
        
            if ($("#overall_graph").length) {
                var overall_graph = Highcharts.chart('overall_graph', {
                    chart: {
                        polar: true,
                        type: 'line'
                    },
                
                    title: {
                        text: ''
                    },
                
                    pane: {
                        size: '80%'
                    },
                
                    xAxis: {
                        type: 'datetime',
                        categories: ['Temperature', 'Humidity', 'Soil Moisture', 'Sunlight', 'Water Level'],
                        tickmarkPlacement: 'on',
                        lineWidth: 0
                    },
                
                    yAxis: {
                        gridLineInterpolation: 'polygon',
                        lineWidth: 0,
                        min: 0,
                        ceiling: 125,
                    },
                
                    tooltip: {
                        shared: true,
                        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
                    },
                
                    series: [{
                        name: 'Minimum',
                        data: minimum,
                        pointPlacement: 'off'
                    }, {
                        name: 'Maximum',
                        data: maximum,
                        pointPlacement: 'off'
                    }, {
                        name: 'Current',
                        data: current,
                        pointPlacement: 'on'
                    }],
                
                    responsive: {
                        rules: [{
                            condition: {
                                maxWidth: 500
                            },
                            chartOptions: {
                                legend: {
                                    align: 'center',
                                    verticalAlign: 'bottom',
                                    layout: 'horizontal'
                                },
                                pane: {
                                    size: '70%'
                                }
                            }
                        }]
                    }
                
                });
            }

            if ($("#temperature_graph").length) {
                var temperature_graph = Highcharts.chart('temperature_graph', {
                    chart: {
                        type: 'line',
                        animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10
                    },
                
                    title: {
                        text: ''
                    },

                    time: {
                        useUTC: false
                    },
                
                    xAxis: {
                        type: 'datetime',
                        tickAmount: 10
                    },
                
                    yAxis: {
                        title: {
                            text: 'Temperature in °C'
                        },
                        min: 0,
                        max: 60,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.y}°C on {point.x:%d-%m-%Y at %H:%M}'
                    },
                
                    legend: {
                        enabled: false
                    },
                
                    series: [{
                        name: 'Temperature',
                        data: logs.map(function(log) {
                            return [(new Date(log[0])).getTime(),log[1]]
                        }).reverse()
                    }]
                });
            }
            
            if ($("#humidity_graph").length) {
                var humidity_graph = Highcharts.chart('humidity_graph', {
                    chart: {
                        type: 'line',
                        animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10
                    },
                
                    title: {
                        text: ''
                    },

                    time: {
                        useUTC: false
                    },
                
                    xAxis: {
                        type: 'datetime',
                        tickAmount: 10
                    },
                
                    yAxis: {
                        title: {
                            text: 'Humidity in %'
                        },
                        min: 0,
                        max: 100,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.y}% on {point.x:%d-%m-%Y at %H:%M}'
                    },
                
                    legend: {
                        enabled: false
                    },
                
                    series: [{
                        name: 'Humidity',
                        data: logs.map(function(log) {
                            return [(new Date(log[0])).getTime(),log[2]]
                        }).reverse()
                    }]
                });
            }
            
            if ($("#moisture_graph").length) {
                var moisture_graph = Highcharts.chart('moisture_graph', {
                    chart: {
                        type: 'line',
                        animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10
                    },
                
                    title: {
                        text: ''
                    },

                    time: {
                        useUTC: false
                    },
                
                    xAxis: {
                        type: 'datetime',
                        tickAmount: 10
                    },
                
                    yAxis: {
                        title: {
                            text: 'Soil Moisture in %'
                        },
                        min: 0,
                        max: 100,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.y}% on {point.x:%d-%m-%Y at %H:%M}'
                    },
                
                    legend: {
                        enabled: false
                    },
                
                    series: [{
                        name: 'Moisture',
                        data: logs.map(function(log) {
                            return [(new Date(log[0])).getTime(),log[3]]
                        }).reverse()
                    }]
                });
            }
            
            if ($("#sunlight_graph").length) {
                var sunlight_graph = Highcharts.chart('sunlight_graph', {
                    chart: {
                        type: 'line',
                        animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10
                    },
                
                    title: {
                        text: ''
                    },

                    time: {
                        useUTC: false
                    },
                
                    xAxis: {
                        type: 'datetime',
                        tickAmount: 10
                    },
                
                    yAxis: {
                        title: {
                            text: 'Sunlight in hours/day'
                        },
                        min: 0,
                        max: 10,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.y} hours on {point.x:%d-%m-%Y at %H:%M}'
                    },
                
                    legend: {
                        enabled: false
                    },
                
                    series: [{
                        name: 'sunlight',
                        data: logs.map(function(log) {
                            return [(new Date(log[0])).getTime(),log[4]]
                        }).reverse()
                    }]
                });
            }
        
            if ($("#waterlevel_graph").length) {
                var waterlevel_graph = Highcharts.chart('waterlevel_graph', {
                    chart: {
                        type: 'line',
                        animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10
                    },
                
                    title: {
                        text: ''
                    },

                    time: {
                        useUTC: false
                    },
                
                    xAxis: {
                        type: 'datetime',
                        tickAmount: 10
                    },
                
                    yAxis: {
                        title: {
                            text: 'Waterlevel in %'
                        },
                        min: 0,
                        max: 100,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.y}% on {point.x:%d-%m-%Y at %H:%M}'
                    },
                
                    legend: {
                        enabled: false
                    },
                
                    series: [{
                        name: 'waterlevel',
                        data: logs.map(function(log) {
                            return [(new Date(log[0])).getTime(),log[5]]
                        }).reverse()
                    }]
                });
            }
        }, function (err) {this.console.log(err);})
        .catch(function(error) {
            this.console.log(error);
        })
    }

    if (window.location.pathname == '/' | window.location.pathname == '/index.html') {
        
        var current = ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"];
        var min = [0, 0, 0, 0, 0];
        var max = [100, 100, 100, 10, 100];

        display_home = function() {
            if (current[0] != "NA") {
                if (current[0] == "Good") {
                    $("#overallstatus").html('<div style="color: green;"><p><h3>Good</h3></p><p>All systems operational<br>All parameters are within limits</p></div>');
                } else if (current[0] == "Mild") {
                    $("#overallstatus").html('<div style="color: orange;"><p><h3>Mild Issue</h3></p><p>All systems operational<br>Some parameters are out of limits</p></div>');
                } else if (current[0] == "Bad") {
                    $("#overallstatus").html('<div style="color: red;"><p><h3>Major Issue</h3></p><p>All systems operational<br>Some parameters are out of limits</p></div>');
                } else if (current[0] == "Offline") {
                    $("#overallstatus").html('<div style="color: red;"><p><h3>Server Offline</h3></p><p>All systems shutdown</p></div>');
                } else {
                    $("#overallstatus").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[0]+'</p></div>');
                }
                
            } else {
                $("#overallstatus").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            }

            if (current[4] != "NA") {
                if (current[4] >= min[0] && current[4] <= max[0]) {
                    $("#temperature").html('<div style="color: green;"><p><h3>'+current[4]+'°C</h3></p><p>Suitable Temperature</p></div>');
                } else if (current[4] < min[0]) {
                    $("#temperature").html('<div style="color: blue;"><p><h3>'+current[4]+'°C</h3></p><p>Temperature Low</p></div>');
                } else if (current[4] > max[0]) {
                    $("#temperature").html('<div style="color: red;"><p><h3>'+current[4]+'°C</h3></p><p>Temperature High</p></div>');
                } else {
                    $("#temperature").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[4]+'</p></div>');
                }
                
            } else {
                $("#temperature").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            }

            if (current[5] != "NA") {
                if (current[5] >= min[1] && current[5] <= max[1]) {
                    $("#humidity").html('<div style="color: green;"><p><h3>'+current[5]+'%</h3></p><p>Perfect Humidity</p></div>');
                } else if (current[5] < min[1]) {
                    $("#humidity").html('<div style="color: red;"><p><h3>'+current[5]+'%</h3></p><p>Humidity Low</p></div>');
                } else if (current[5] > max[1]) {
                    $("#humidity").html('<div style="color: orange;"><p><h3>'+current[5]+'%</h3></p><p>Humidity High</p></div>');
                } else {
                    $("#humidity").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[5]+'</p></div>');
                }
                
            } else {
                $("#humidity").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            } 

            if (current[6] != "NA") {
                if (current[6] >= min[2] && current[6] <= max[2]) {
                    $("#moisture").html('<div style="color: green;"><p><h3>'+current[6]+'%</h3></p><p>Happy Soil</p></div>');
                } else if (current[6] < min[2]) {
                    $("#moisture").html('<div style="color: red;"><p><h3>'+current[6]+'%</h3></p><p>Dry Soil</p></div>');
                } else if (current[6] > max[2]) {
                    $("#moisture").html('<div style="color: orange;"><p><h3>'+current[6]+'%</h3></p><p>Wet Soil</p></div>');
                } else {
                    $("#moisture").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[6]+'</p></div>');
                }
                
            } else {
                $("#moisture").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            } 

            if (current[7] != "NA") {
                if (current[7] >= min[3] && current[7] <= max[3]) {
                    $("#sunlight").html('<div style="color: green;"><p><h3>'+current[7]+' hours</h3></p><p>Sunny Day</p></div>');
                } else if (current[7] < min[3]) {
                    $("#sunlight").html('<div style="color: blue;"><p><h3>'+current[7]+' hours</h3></p><p>Overcast</p></div>');
                } else if (current[7] > max[3]) {
                    $("#sunlight").html('<div style="color: red;"><p><h3>'+current[7]+' hours</h3></p><p>Too much Sunlight</p></div>');
                } else {
                    $("#sunlight").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[7]+'</p></div>');
                }
                
            } else {
                $("#sunlight").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            } 

            if (current[8] != "NA") {
                if (current[8] >= min[4] && current[8] <= max[4]) {
                    $("#waterlevel").html('<div style="color: green;"><p><h3>'+current[8]+'%</h3></p><p>Water Level Ok</p></div>');
                } else if (current[8] < min[4]) {
                    $("#waterlevel").html('<div style="color: red;"><p><h3>'+current[8]+'%</h3></p><p>Water Level Low</p></div>');
                } else if (current[8] > max[4]) {
                    $("#waterlevel").html('<div style="color: blue;"><p><h3>'+current[8]+'%</h3></p><p>Water Level High</p></div>');
                } else {
                    $("#waterlevel").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[8]+'</p></div>');
                }
                
            } else {
                $("#waterlevel").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            }

            if (current[1] != "NA") {
                if (current[1] == "Idle") {
                    $("#waterpump").html('<div style="color: green;"><p><h3>'+current[1]+'</h3></p><p>Switched Off</p></div>');
                } else if (current[1] == "Active") {
                    $("#waterpump").html('<div style="color: orange;"><p><h3>'+current[1]+'</h3></p><p>Switched On</p></div>');
                } else {
                    $("#waterpump").html('<div style="color: red;"><p>Server gave a malformed response</p><p>Response:<br/>'+current[0]+'</p></div>');
                }
                
            } else {
                $("#waterpump").html('<div><p><h3>...</h3></p><p>Retrieving data from server</p></div>')
            }
        }
        display_home();

        getindex = function() {
            get("latest")
            .then(function(latest) {
                if (latest[3] != undefined) {
                    if (latest[3] != current[3]) {
                        current = latest;
                    }
                } else {
                    current = ["Offline", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"];
                }
            }, function(err) {this.console.log(err);})
            .catch(function(error) {
                this.console.log(error);
            });

            get("limits")
            .then(function(limits) {
                if (limits[0] != min) {
                    min = limits[0];
                }
                if (limits[1] != max) {
                    max = limits[1];
                }
            }, function(err) {this.console.log(err);})
            .catch(function(error) {
                this.console.log(error);
            })
            .then(function () {
                display_home();
            });
        };
        getindex();

        this.setInterval(function () {
            getindex();
        }, frequency);

    }

    if (window.location.pathname == '/actions.html') {
        
        var currentstatus = {
            timestamp: "NA",
            status: "NA",
            station: "NA",
            motor: "NA",
            settings: {
              temperature: "NA",
              humidity: "NA",
              moisture: "NA",
              email: "NA",
              sms: "NA"
            }
        };
        var min = ["NA", "NA", "NA", "NA", "NA"];
        var max = ["NA", "NA", "NA", "NA", "NA"];

        
        $("#restartButton").click(function () {
            post('action',{
                "action":"restart"
            })
            .then(function(resp) {
                if (resp == "Successful") {
                    currentstatus.station = "Offline";
                    $("#stationstatus").html('<span style="color: orange;">Restarting</span>');
                }
                else {
                    alert("Couldn't restart station. Error "+resp);
                }
            }, function (err) {this.console.log(err);})
            .catch(function(error) {this.console.log(error);})
        });

        $("#shutdownButton").click(function () {
            post('action',{
                "action":"shutdown"
            })
            .then(function(resp) {
                if (resp == "Successful") {
                    currentstatus.station = "Offline";
                    $("#stationstatus").html('<span style="color: red;">Offline</span>');
                }
                else {
                    alert("Couldn't shutdown station. Error "+resp);
                }
            }, function (err) {this.console.log(err);})
            .catch(function(error) {this.console.log(error);})
        });

        $("#pumpButton").click(function () {
            post('action',{
                "action":"toggle"
            })
            .then(function(resp) {
                if (resp == "Successful") {
                    if (currentstatus.motor == "Idle") {
                        currentstatus.motor = "Active";
                        $("#pumpstatus").html('<span style="color: orange;">'+currentstatus.motor+'</span>');
                    }
                    else if (currentstatus.motor == "Active") {
                        currentstatus.motor = "Idle";
                        $("#pumpstatus").html('<span style="color: green;">'+currentstatus.motor+'</span>');
                    }
                }
                else {
                    alert("Couldn't toggle motor. Error "+resp);
                }
            }, function (err) {this.console.log(err);})
            .catch(function(error) {this.console.log(error);})
        });

        $("#updatesettingsButton").click(function () {
            post('settings', {
                "temperature": $("#tempalert").is(":checked"),
                "humidity": $("#humidalert").is(":checked"),
                "moisture": $("#moisturealert").is(":checked"),
                "email": $("#settingsemailalert").is(":checked"),
                "sms": $("#settingssmsalert").is(":checked")
            })
            .then(function(resp1) {
                post('limits', {
                    "data": [
                    [
                        $("#temprature_range").data("ionRangeSlider").result.from,
                        $("#humidity_range").data("ionRangeSlider").result.from,
                        $("#moisture_range").data("ionRangeSlider").result.from,
                        $("#sunlight_range").data("ionRangeSlider").result.from,
                        $("#waterlevel_range").data("ionRangeSlider").result.from
                    ],
                    [
                        $("#temprature_range").data("ionRangeSlider").result.to,
                        $("#humidity_range").data("ionRangeSlider").result.to,
                        $("#moisture_range").data("ionRangeSlider").result.to,
                        $("#sunlight_range").data("ionRangeSlider").result.to,
                        $("#waterlevel_range").data("ionRangeSlider").result.to
                    ]
                    ]
                })
                .then(function(resp2) {
                    if (resp1 == "Successful" | resp2 == "Successful") {
                        alert("Settings Updated");
                    }
                    
                });
            }, function (err) {this.console.log(err);})
            .catch(function(error) {this.console.log(error);});
            
            $("#temprature_range").data("ionRangeSlider").update({
                from: $("#temprature_range").data("ionRangeSlider").result.from,
                to: $("#temprature_range").data("ionRangeSlider").result.to
            }     
            );

            $("#humidity_range").data("ionRangeSlider").update({
                from: $("#humidity_range").data("ionRangeSlider").result.from,
                to: $("#humidity_range").data("ionRangeSlider").result.to
            }     
            );

            $("#moisture_range").data("ionRangeSlider").update({
                from: $("#moisture_range").data("ionRangeSlider").result.from,
                to: $("#moisture_range").data("ionRangeSlider").result.to
            }     
            );

            $("#sunlight_range").data("ionRangeSlider").update({
                from: $("#sunlight_range").data("ionRangeSlider").result.from,
                to: $("#sunlight_range").data("ionRangeSlider").result.to
            }     
            );

            $("#waterlevel_range").data("ionRangeSlider").update({
                from: $("#waterlevel_range").data("ionRangeSlider").result.from,
                to: $("#waterlevel_range").data("ionRangeSlider").result.to
            }     
            );
        });

        display_home = function() {
            if (currentstatus.station != "NA") {
                if (currentstatus.station == "Operational") {
                    $("#stationstatus").html('<span style="color: green;">'+currentstatus.station+'</span>');
                } else if (currentstatus.station == "Offline") {
                    $("#stationstatus").html('<span style="color: red;">'+currentstatus.station+'</span>');
                } else {
                    $("#stationstatus").html('<span style="color: red;">'+currentstatus.station+'<br/><h6>Server gave a malformed response</h6></span>');
                }
                
            } else {
                $("#stationstatus").html('<span><small>Loading...</small></span>');
            }

            if (currentstatus.motor != "NA") {
                if (currentstatus.motor == "Idle") {
                    $("#pumpstatus").html('<span style="color: green;">'+currentstatus.motor+'</span>');
                } else if (currentstatus.motor == "Active") {
                    $("#pumpstatus").html('<span style="color: orange;">'+currentstatus.motor+'</span>');
                } else {
                    $("#pumpstatus").html('<span style="color: red;">'+currentstatus.motor+'<br/><h6>Server gave a malformed response</h6></span>');
                }
                
            } else {
                $("#pumpstatus").html('<span><small>Loading...</small></span>');
            }

            if (min[0] != "NA" && max[0] != "NA") {
                if ($("#temprature_range").data("ionRangeSlider").options.from != min[0] | $("#temprature_range").data("ionRangeSlider").options.to != max[0]) {
                    $("#temprature_range").data("ionRangeSlider").update({
                        type: "double",
                        min: 0,
                        max: 60,
                        from: min[0],
                        to: max[0],
                        grid: true,
                        postfix: "°C",
                    }     
                    );
                }
            }

            if (min[1] != "NA" && max[1] != "NA") {
                if ($("#humidity_range").data("ionRangeSlider").options.from != min[1] | $("#humidity_range").data("ionRangeSlider").options.to != max[1]) {
                    $("#humidity_range").data("ionRangeSlider").update({
                        type: "double",
                        min: 0,
                        max: 100,
                        from: min[1],
                        to: max[1],
                        grid: true,
                        postfix: "%",
                    }     
                    );
                }
            }

            if (min[2] != "NA" && max[2] != "NA") {
                if ($("#moisture_range").data("ionRangeSlider").options.from != min[2] | $("#moisture_range").data("ionRangeSlider").options.to != max[2]) {
                    $("#moisture_range").data("ionRangeSlider").update({
                        type: "double",
                        min: 0,
                        max: 100,
                        from: min[2],
                        to: max[2],
                        grid: true,
                        postfix: "%",
                    }     
                    );
                }
            }

            if (min[3] != "NA" && max[3] != "NA") {
                if ($("#sunlight_range").data("ionRangeSlider").options.from != min[3] | $("#sunlight_range").data("ionRangeSlider").options.to != max[3]) {
                    $("#sunlight_range").data("ionRangeSlider").update({
                        type: "double",
                        min: 0,
                        max: 10,
                        from: min[3],
                        to: max[3],
                        grid: true,
                        postfix: " hours",
                    }     
                    );
                }
            }

            if (min[4] != "NA" && max[4] != "NA") {
                if ($("#waterlevel_range").data("ionRangeSlider").options.from != min[4] | $("#waterlevel_range").data("ionRangeSlider").options.to != max[4]) {
                    $("#waterlevel_range").data("ionRangeSlider").update({
                        type: "double",
                        min: 0,
                        max: 100,
                        from: min[4],
                        to: max[4],
                        grid: true,
                        postfix: "%",
                    }     
                    );
                }
            }

            if (currentstatus.settings.temperature != "NA") {
                $('#tempalert').prop('checked', currentstatus.settings.temperature);
            }

            if (currentstatus.settings.humidity != "NA") {
                $('#humidalert').prop('checked', currentstatus.settings.humidity);
            }

            if (currentstatus.settings.moisture != "NA") {
                $('#moisturealert').prop('checked', currentstatus.settings.moisture);
            }

            if (currentstatus.settings.sms != "NA") {
                $('#settingssmsalert').prop('checked', currentstatus.settings.sms);
            }

            if (currentstatus.settings.email != "NA") {
                $('#settingsemailalert').prop('checked', currentstatus.settings.email);
            }

        }
        display_home();

        getaction = function() {
            get("status")
            .then(function(status) {
                if (status.timestamp != undefined) {
                    if (status.timestamp != currentstatus.timestamp) {
                        currentstatus = status;
                    }
                } else {
                    currentstatus.station = "Offline";
                }
            }, function(err) {
                this.console.log(err);
            })
            .catch(function(error) {
                this.console.log(error);
            });
    
            get("limits")
            .then(function(limits) {
                if (limits[0] != min) {
                    min = limits[0];
                }
                if (limits[1] != max) {
                    max = limits[1];
                }
            }, function(err) {this.console.log(err);})
            .catch(function(error) {
                this.console.log(error);
            })
            .then(function () {
                display_home();
            });
        };
        getaction();
        
        this.setInterval(function () {
            getaction();
        }, frequency);

    }
});