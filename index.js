year = 
[
    1928, 1929,
    1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 
    1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 
    1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 
    1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 
    1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 
    1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 
    2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 
    2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 
    2020, 2021, 2022
]

open_year_rate = 
[
    17.76, 24.81, 
    21.18, 15.85, 7.82, 6.83, 10.11, 9.51, 13.40, 17.02, 10.52, 13.08, 
    12.63, 10.48, 8.89, 9.84, 11.66, 13.33, 17.25, 15.20, 15.34, 14.95, 
    16.66, 20.77, 23.80, 26.54, 24.95, 36.75, 45.16, 46.20, 40.33, 55.44, 
    59.91, 57.57, 70.96, 62.69, 75.43, 84.23, 92.18, 80.38, 96.11, 103.93,
    93.00, 91.15, 101.67, 119.10, 97.68, 70.23, 90.90, 107.00, 93.82, 96.73,
    105.76, 136.34, 122.74, 138.34, 164.04, 165.37, 209.59, 246.45, 255.94, 275.31, 
    359.69, 326.45, 417.26, 435.38, 465.44, 459.11, 620.73, 737.01, 975.04, 1228.10,
    1455.22, 1283.27, 1154.67, 909.03, 1108.48, 1202.08, 1268.80, 1416.60, 1447.16, 931.80,
    1132.99, 1271.87, 1277.06, 1462.42, 1831.98, 2058.20, 2012.66, 2257.83, 2695.81, 2510.03,
    3257.85, 3700.65, 4796.56
]

function calc_rate(rate_index, year_term){
    var rate = ( open_year_rate[rate_index + year_term] - open_year_rate[rate_index] ) / open_year_rate[rate_index + 1];

    return rate;
}

function generate_age_array(start_year, range){
    var age_array = [];

    for(var i = 0; i <= range; i++){

        if(i == 0){
            age_array[i] = 0;
        }
        else{
            age_array[i] = start_year + i - 1;
        }
        
    }

    return age_array;
}

function calcuation(initial_amount, contract_fee, start_year, range, year_term, plan1, plan2){
    
    var plan1_rate = parseFloat(document.getElementById("rate1").value);
    plan1_rate = plan1_rate / 100;


    var plan2_rate = parseFloat(document.getElementById("rate2").value);
    plan2_rate = plan2_rate / 100;

    // find index of the start year
    var rate_index = year.findIndex(element => element == start_year);

    var balance = [];

    var rate;
    var count = 1;

    for(var i = 0; i <= range; i++){
        if(i == 0){
            balance[i] = initial_amount;
            count++;
        }
        else if(count == year_term){
            rate = calc_rate(rate_index, year_term);

            if(rate <= 0){
                if(plan1 == "Buffer Rate"){
                    if(plan1_rate < rate){
                        balance[i] = balance[i-1] * ( 1 - (rate - plan1_rate) );
                    }
                    else{
                        balance[i] = balance[i-1];
                    }
                }
            
                if(plan1 == "Floor Rate"){
                    if(plan1_rate < rate){
                        balance[i] = balance[i-1] * (1 - plan1_rate);
                    }
                    else{
                        balance[i] = balance[i-1] * (1 - rate);
                    }
                }

                if(plan1 == "Downside Participation Rate"){
                    balance[i] = balance[i-1] * (1 - ( rate / plan1_rate) );
                }
            }

            else{
                if(plan2 == "Cap Rate"){
                    if(plan2_rate < rate){
                        balance[i] = balance[i-1] * (1 + plan2_rate);
                    }
                    else{
                        balance[i] = balance[i-1] * (1 + rate);
                    }
                }
            
                if(plan2 == "Participation Rate"){
                    balance[i] = balance[i-1] * (1 + ( rate / plan2_rate) );
                }

                if(plan2 == "Step Rate"){
                    balance[i] = balance[i-1] * (1 + plan2_rate);
                }
            }

            balance[i] = balance[i] - contract_fee;
            count = 1;
        }

        else{
            balance[i] = balance[i-1] - contract_fee;
            count++;
        }
        
        rate_index++;
    }

    return balance;
}

var ctx = document.getElementById('myChart').getContext("2d");
var chart = null;


function create_chart() {
    var initial_amount = parseFloat(document.getElementById("initial_amount").value);
    var contract_fee = parseFloat(document.getElementById("contract_fee").value);
    var start_year = parseFloat(document.getElementById("start_year").value);
    var range = parseFloat(document.getElementById("range").value);
    var year_term = parseFloat(document.getElementById("year_term").value);
    var plan1 = document.getElementById("plan1").value;
    var plan2 = document.getElementById("plan2").value;

    var balance = calcuation(initial_amount, contract_fee, start_year, range, year_term, plan1, plan2);

    var age_array = generate_age_array(start_year, range);
   
    if (chart != null) {
        chart.destroy();
    }

    var myData = {
        labels: age_array,
        datasets: [{
            label: 'balance',
            data: balance,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: myData,

        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Investment',
                    font: {
                        size: 20
                    },
                    color: "black"
                },
            },

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Year",
                        font: {
                            size: 15,
                            style: "bold"
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Money ($)",
                        font: {
                            size: 15
                        }
                    }
                }
            }
        }
    });
}