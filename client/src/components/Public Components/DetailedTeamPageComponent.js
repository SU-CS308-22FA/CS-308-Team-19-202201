import Plot from "react-plotly.js";
import FFP_API from "../../app/api";
import CircularProgressComponent from "./CircularProgressComponent";
import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Avatar, Button, Box, Grid, Typography } from "@mui/material";
import { UserContext } from "../../contexts/userContext";
import SimpleLinearRegression from "ml-regression-simple-linear";

export default function DetailedTeamPageComponent() {
  const { token } = useContext(UserContext);
  const [team, setTeam] = useState(null);
  const [revenues, setRevenues] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchTeam = async () => {
      const response = await FFP_API.get(`/teams/${id}`);
      setTeam(response.data);
    };
    const fetchRevenues = async () => {
      const response = await FFP_API.get(`/revenues/${id}`);
      setRevenues(response.data);
    };
    const fetchExpenses = async () => {
      const response = await FFP_API.get(`/expenses/${id}`);
      setExpenses(response.data);
    };
    fetchTeam();
    fetchRevenues();
    fetchExpenses();
  }, [setTeam, setRevenues, setExpenses, id]);

  // takes an integer input and returns sequence of integers from 0 to input
  function getSequence(input) {
    let sequence = [];
    for (let i = 1; i < input + 1; i++) {
      sequence.push(i);
    }
    return sequence;
  }

  // write a linear regression prediction function for revenues
  function predictRevenue() {
    let x = getSequence(Object.keys(revenues.ticketing).length);
    let y = [];

    // get the values of each revenue objects
    // for (const [key, value] of Object.entries(revenues.ticketing)) {
    //   y.push(value + revenues.marketing[key] + revenues.broadcasting[key]);
    // }
    // revert the order of the y array
    //y = y.reverse();

    let expensesByMonth = {};
    for (const [key, value] of Object.entries(revenues.ticketing)) {
      expensesByMonth[key] = value;
    }
    for (const [key, value] of Object.entries(revenues.marketing)) {
      expensesByMonth[key] += value;
    }
    for (const [key, value] of Object.entries(revenues.broadcasting)) {
      expensesByMonth[key] += value;
    }
    let months = [];
    for (const [key, value] of Object.entries(expensesByMonth)) {
      months.push(String(key));
    }
    months.sort((a, b) => {
      const aYear = Number(a.slice(0, 4));
      const bYear = Number(b.slice(0, 4));
      const aMonth = Number(a.slice(5, 7));
      const bMonth = Number(b.slice(5, 7));
      if (aYear === bYear) {
        return aMonth - bMonth;
      } else {
        return aYear - bYear;
      }
    });
    for (let i = 0; i < months.length; i++) {
      y.push(expensesByMonth[months[i]]);
    }
    // print y
    console.log("y is in Revenues:", y);

    // create a linear regression model
    const model = new SimpleLinearRegression(x, y);

    // predict the next revenue
    let prediction = model.predict(x.length + 1);
    console.log("Revenue prediction for next month is:" + prediction);
    return prediction;
  }

  // write a linear regression prediction function for expenses
  function predictExpense() {
    let x = getSequence(Object.keys(expenses.salaries).length);
    let y = [];
    // get the values of each expense objects
    // for (const [key, value] of Object.entries(expenses.salaries)) {
    //   y.push(value + expenses.amortization[key] + expenses.operational[key]);
    // }

    // get expenses by considering key values as month-year and sorting them
    
    let expensesByMonth = {};
    for (const [key, value] of Object.entries(expenses.salaries)) {
      expensesByMonth[key] = value;
    }
    for (const [key, value] of Object.entries(expenses.amortization)) {
      expensesByMonth[key] += value;
    }
    for (const [key, value] of Object.entries(expenses.operational)) {
      expensesByMonth[key] += value;
    }
    let months = [];
    for (const [key, value] of Object.entries(expensesByMonth)) {
      months.push(String(key));
    }
    months.sort((a, b) => {
      const aYear = Number(a.slice(0, 4));
      const bYear = Number(b.slice(0, 4));
      const aMonth = Number(a.slice(5, 7));
      const bMonth = Number(b.slice(5, 7));
      if (aYear === bYear) {
        return aMonth - bMonth;
      } else {
        return aYear - bYear;
      }
    });
    for (let i = 0; i < months.length; i++) {
      y.push(expensesByMonth[months[i]]);
    }
    // print y
    console.log("y is in Expenses:", y);


    // revert the order of the y array
    //y = y.reverse();

    // create a linear regression model
    const model = new SimpleLinearRegression(x, y);

    // predict the next expense
    let prediction = model.predict(x.length + 1);
    console.log("Expense prediction for next month is:" + prediction);
    return prediction;
  }

  // predict Net Spend
  function predictNetSpend() {
    let netSpend = predictRevenue() - predictExpense();
    console.log("Net Spend prediction for next month is:" + netSpend);
    return netSpend;
  }

  /**
   * This function takes an object as input and
   * returns the total of all the values in the object
   *
   * @function returnTotalOfObject
   * @param {Object} obj Object to be summed up
   * @returns {integer} total of all the values in the object
   */
  function returnTotalOfObject(obj) {
    let total = 0;
    for (let i = 0; i < Object.keys(obj).length; i++) {
      total += obj[Object.keys(obj)[i]];
    }
    return total;
  }

  function returnLastValueOfObject(obj) {
    return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
  }

  function plot(team, revenues, expenses) {
    let months = [];
    for (const [key, value] of Object.entries(revenues.ticketing)) {
      months.push(String(key));
    }
    months.sort((a, b) => {
      const aYear = Number(a.slice(0, 4));
      const bYear = Number(b.slice(0, 4));
      const aMonth = Number(a.slice(5, 7));
      const bMonth = Number(b.slice(5, 7));
      if (aYear > bYear) return 1;
      else if (aYear < bYear) return -1;
      else return aMonth - bMonth;
    });
    let rev = [];
    let cumRev = [];
    for (let i = 0; i < months.length; i++) {
      rev.push(
        revenues.ticketing[months[i]] +
          revenues.marketing[months[i]] +
          revenues.broadcasting[months[i]]
      );
      if (cumRev.length === 0) {
        cumRev.push(
          revenues.ticketing[months[i]] +
            revenues.marketing[months[i]] +
            revenues.broadcasting[months[i]]
        );
      } else {
        cumRev.push(
          revenues.ticketing[months[i]] +
            revenues.marketing[months[i]] +
            revenues.broadcasting[months[i]] +
            cumRev[cumRev.length - 1]
        );
      }
    }
    let exp = [];
    let cumExp = [];
    for (let i = 0; i < months.length; i++) {
      exp.push(
        expenses.salaries[months[i]] +
          expenses.amortization[months[i]] +
          expenses.operational[months[i]]
      );
      if (cumExp.length === 0) {
        cumExp.push(
          expenses.salaries[months[i]] +
            expenses.amortization[months[i]] +
            expenses.operational[months[i]]
        );
      } else {
        cumExp.push(
          expenses.salaries[months[i]] +
            expenses.amortization[months[i]] +
            expenses.operational[months[i]] +
            cumExp[cumExp.length - 1]
        );
      }
    }
    const content = (
      <Plot
        key={team._id}
        data={[
          {
            type: "bar",
            x: months,
            y: rev,
            name: "Monthly Revenues",
          },
          {
            type: "bar",
            x: months,
            y: exp,
            name: "Monthly Expenses",
          },
          {
            type: "line",
            x: months,
            y: cumExp,
            name: "Cumulative Expenses",
          },
          {
            type: "line",
            x: months,
            y: cumRev,
            name: "Cumulative Revenues",
          },
        ]}
        layout={{
          width: 600,
          height: 500,
          title: team.teamName,
          yaxis: {
            title: "Amount in Million TLs",
          },
          xaxis: {
            title: "Months",
          },
        }}
      />
    );
    return content;
  }
  const content = (
    <>
      {team && revenues && expenses ? (
        <Grid
          container
          spacing={1}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={5.5}>
            {plot(team, revenues, expenses)}
          </Grid>
          <Grid item xs={6.5}>
            <Typography variant="h4" align="center" sx={{ mt: 4 }}>
              Information About
            </Typography>
            <Typography
              variant="h5"
              component="h5"
              align="center"
              color="#0000FF"
            >
              <a href={team.wikiLink} target="_blank" rel="noreferrer">
                {team.teamName}
              </a>
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Avatar sx={{ width: "auto", mt: 2, mb: 2 }} src={team.logoURL} />
            </Box>
            {token ? (
              <Typography variant="body1" align="center">
                <Button
                  variant="contained"
                  color="secondary"
                  href="/sendnotification"
                >
                  Send Email
                </Button>
              </Typography>
            ) : null}
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Manager: {team.manager}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Season Starting Budget: {team.seasonBudget} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Total Revenues:{" "}
                  {returnTotalOfObject(revenues.ticketing) +
                    returnTotalOfObject(revenues.marketing) +
                    returnTotalOfObject(revenues.broadcasting)}{" "}
                  Mil. TL
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Current Budget: {team.currentBudget} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Total Expenses:{" "}
                  {returnTotalOfObject(expenses.salaries) +
                    returnTotalOfObject(expenses.amortization) +
                    returnTotalOfObject(expenses.operational)}{" "}
                  Mil. TL
                </Typography>
              </Grid>
            </Grid>

            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Net Spend:{" "}
              {(returnTotalOfObject(revenues.ticketing) +
                returnTotalOfObject(revenues.marketing) +
                returnTotalOfObject(revenues.broadcasting) +
                -(
                  returnTotalOfObject(expenses.salaries) +
                  returnTotalOfObject(expenses.amortization) +
                  returnTotalOfObject(expenses.operational)
                )) *
                -1}{" "}
              Mil. TL
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Net Spend Prediction for Next Month: {predictNetSpend() * -1} Mil.
              TL
            </Typography>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Last Month Ticketing Revenue:
                  {" " + returnLastValueOfObject(revenues.ticketing)} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Last Month Marketing Revenue:
                  {" " + returnLastValueOfObject(revenues.marketing)} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Last Month Broadcasting Revenue:
                  {" " + returnLastValueOfObject(revenues.broadcasting)} Mil. TL
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Last Month Salary Expenses:
                  {" " + returnLastValueOfObject(expenses.salaries)} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Last Month Amortization Expenses:
                  {" " + returnLastValueOfObject(expenses.amortization)} Mil. TL
                </Typography>
                <Typography variant="body1" align="center">
                  Last Month Operational Expenses:
                  {" " + returnLastValueOfObject(expenses.operational)} Mil. TL
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Associated Lawyers:{" "}
                  {team.lawyers.map((lawyer) => {
                    return lawyer + ", ";
                  })}{" "}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center">
                  Associated Board Members:{" "}
                  {team.boardMembers.map((member) => {
                    return member + ", ";
                  })}{" "}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <CircularProgressComponent />
      )}
    </>
  );
  return content;
}
