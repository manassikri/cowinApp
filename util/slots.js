const axios = require("axios");
const Table = require("tty-table");
const chalk = require("chalk");
const notifier = require("node-notifier") 
var inquirer = require('inquirer');

const { config, options } = require("./config");

module.exports = function (districtid) {
  var date = new Date();
  var todaysDate = `${date.getDate()}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;


  inquirer
    .prompt([{

      type:"list",
      name:"choice",
      message:"Please select your age group",
      choices:[

        {
          name :"All Ages",
          value:""
        },
        {
          name :"45+",
          value:"45"
        },
        {
          name :"18-45",
          value:"18"
        }
      ]

    }
      
    ])
    .then((answers) => {
      console.log("/////////////////////////////////////");
      console.log(answers);

      axios

        .get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtid}&date=${todaysDate}`, config)
        .then(function (response) {
           
          let header = [
            //   {
            //   value: "center_id",
            //   headerColor: "cyan",
            //   color: "white",
            //   align: "left",
            //   alias:"Center ID",
            //   width: 20
            // },
            {
              value: "center",
              color: "red",
              alias: "Center Name",
              width: 40
            },
            {
              value: "address",
              color: "red",
              alias: "Center Address",
              width: 90
            },
            {
              value: "available",
              color: "red",
              alias: "Available Slot",
              width: 40

            },
            {
              value: "vaccine",
              color: "red",
              alias: "Vaccine",
              width: 40

            },
            {
              value: "age",
              color: "red",
              alias: "Age",
              width: 40

            },
            {
              value: "date",
              color: "red",
              alias: "Date",
              width: 40

            }


          ]
          // const out = Table(header,response.data.centers,options).render()

          var finalData = [];
          var districtName;
          response.data.centers.forEach((item) => {
            districtName = item.district_name;
            item.sessions.forEach((session) => {
              if(answers.choice==""){
              //console.log(session);
              let ourData = {
                center: item.name,
                address: item.address,
                available: session.available_capacity,
                vaccine: session.vaccine,
                age: session.min_age_limit,
                date: session.date,
              }
              finalData.push(ourData);
            }else if(answers.choice==session.min_age_limit){
              let ourData = {
                center: item.name,
                address: item.address,
                available: session.available_capacity,
                vaccine: session.vaccine,
                age: session.min_age_limit,
                date: session.date,
              }
              finalData.push(ourData);


            }
            });
          });
          // console.log(finalData); //prints output

         const out = Table(header, finalData, options).render()
         console.log(chalk.blue.bgYellow.bold(`Date for which are fetching data -> ${todaysDate}`));
         console.log(chalk.blue.bgYellow.bold(`District -> ${districtName}`));
         console.log(out); //prints output
         notifier.notify({

          title : "Cowin slots found",
          subtitle : "Finally you can get vaccinated",
          message : "We have found a slot for you",
          wait:true
         })
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });


};