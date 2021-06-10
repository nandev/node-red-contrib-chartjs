document.addEventListener("DOMContentLoaded", function(event) {
    // resize canvas to screen
    function resizeCanvas() {
        $("#container").css({
            "height": window.innerHeight - $("#toolbar").outerHeight(),
            "width": window.innerWidth
        });
    }

    $(window).resize(function() {
        resizeCanvas();
    });

    resizeCanvas();

    // implement message topic event    
    var topic = window.location.pathname.replace('/', '');

    // connect to socket.io server
    var socket = io.connect(window.location.origin, {query:'topic=' + topic});

    socket.on(topic, function(red){
        console.log(red);

        // update chart dataset
        if (red.msg !== undefined) {
            var dataset = {
                label: red.msg.payload.channel,                        
                backgroundColor: red.msg.payload.color,
                borderColor: red.msg.payload.color,
                data: [],
                fill: false
            };

            chart.config.data.labels = [];
            chart.config.data.datasets = [];

            red.msg.payload.dataset.forEach(item => {
                chart.config.data.labels.push(item.x);
                dataset.data.push(item.y);
            });
                    
            chart.config.data.datasets.push(dataset);

            // refresh chart
            chart.update();
        }

        // update chart configuration
        if (red.config !== undefined) {            
            config.options.title.text = red.config.title;
            config.options.scales['xAxes'][0].scaleLabel.labelString = red.config.xaxis;
            config.options.scales['yAxes'][0].scaleLabel.labelString = red.config.yaxis;
            try {
                let other_options = JSON.parse(red.config.options);
                Object.entries(other_options).forEach(([key, value]) => config.options[key]=value);
            }
            catch(err) {
                console.log("Error parsing other options for chart:", err);
            }
            
            // refresh chart
            chart.update();
        }
      });

    // export event
    $(".dropdown-menu").on("click", "a", function(event) {
        // set a new white canvas to be exported
        destinationCanvas = document.createElement("canvas");
        destinationCanvas.width = canvas.width;
        destinationCanvas.height = canvas.height;

        var ctx = destinationCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas, 0, 0);

        var canvasImg = destinationCanvas.toDataURL('image/png', 1.0);

        // export to image or pdf file
        if (event.target.id == 'image') {
            var link = document.createElement('a')

            link.download = 'image'
            link.href = canvasImg
            link.click()            
        }
        else {
            var doc = new jsPDF('landscape');
            
            doc.addImage(canvasImg, 'JPEG', 10, 10, 280, 110 );
	        doc.save('canvas.pdf');
        }
    });

    // get canvas chart
    var canvas = document.getElementById('chart'); 
    var ctx = canvas.getContext('2d');

    var config = {
        type: 'polarArea',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Polar Area Chart'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Item'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    // Global Chart Options
    Chart.defaults.global.defaultFontColor = 'grey';
    Chart.defaults.global.defaultFontSize = 16;

    var chart = new Chart(ctx, config);	
});