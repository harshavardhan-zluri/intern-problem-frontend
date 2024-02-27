"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import styled from "styled-components";
import Papa from "papaparse";
import axios from "axios";

const Home = () => {
  const [data, setData] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [entries, setEntries] = useState([]);
  const [convertedJsonData, setConvertedJsonData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(80);
  const [resultArray, setResultArray] = useState([]);
  const [editedItem, setEditedItem] = useState(null);

  const handleAddEntry = () => {
    setEntries([...entries, { description: "", amount: "" }]);
  };

  // useEffect(() => {
  //   const fetchExchangeRate = async () => {
  //     try {
  //       const response = await axios.get(
  //         'https://api.exchangeratesapi.io/latest?base=USD'
  //       );
  //       const inrRate = response.data.rates.INR;
  //       setExchangeRate(inrRate);
  //     } catch (error) {
  //       console.error('Error fetching exchange rate:', error);
  //     }
  //   };

  //   fetchExchangeRate();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/apiTrial/");
        const jsonData = await response.json();
        console.log(jsonData);
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/apiTrial/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entries),
      });

      const data = await response.json();
      console.log(data); // Handle the response data as needed

      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:3000/apiTrial/");
          const jsonData = await response.json();
          console.log(jsonData);
          setData(jsonData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
      setEntries([]);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      complete: (result) => {
        // result.data contains the parsed CSV data
        console.log("Parsed CSV data:", result.data);
        setConvertedJsonData(result.data);
        console.log(convertedJsonData);
        var blankDateArray = [...entries, ...result.data];
        const blankCurrencyArray = blankDateArray.map((item) => {
          if (item.date == "") {
            const { date, ...rest } = item;
            return rest;
          }
          return item;
        });
        const finalArray = blankCurrencyArray.map((item) => {
          if (item.currency == "") {
            const { currency, ...rest } = item;
            return rest;
          }
          return item;
        });
        setEntries(finalArray);
      },
      header: true, // Assumes the first row contains column headers
    });
  };

  const handleEdit = (item) => {
    setEditedItem(item);
  };

  const handleUpdate = async (updatedItem) => {
    try {
      // Send PUT or PATCH request to your API (replace with your actual API endpoint)
      await fetch(`http://localhost:3000/apiTrial/${updatedItem._id}`, {
        method: "PATCH", // or 'PUT'
        body: JSON.stringify(updatedItem),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update state to reflect the modified item
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:3000/apiTrial/");
          const jsonData = await response.json();
          console.log(jsonData);
          setData(jsonData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();

      setEditedItem(null); // Clear the edited item
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      // Send DELETE request to your API (replace with your actual API endpoint)
      await fetch(`http://localhost:3000/apiTrial/${itemId}`, {
        method: "DELETE",
      });

      // Update state to remove the deleted item
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:3000/apiTrial/");
          const jsonData = await response.json();
          console.log(jsonData);
          setData(jsonData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  function formatDateToDdMmYyyy(dateString) {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  function exchangeRateValue(currency) {
    switch (currency) {
      case "USD":
        return 82.85;
        break;
      case "MYR":
        return 17.35;
        break;
      case "SGD":
        return 61.62;
        break;
      default:
        return 1;
    }
  }

  return (
    <main className={styles.main}>
      <div>
        <h1>API Data</h1>
        <Grid>
          {data ? (
            <ContractDiv>
              <Contract>
                <h5>Description</h5>
                <p>Amount(currency)</p>
                <p>Amount in INR</p>
                <p>Date</p>
                <p></p>
                <p></p>
              </Contract>
              {data.map((contract, index) => {
                if (editedItem?._id == contract._id) {
                  return (
                    <Contract key={index}>
                      <input
                        type="text"
                        value={editedItem.description}
                        onChange={(e) =>
                          setEditedItem({
                            ...editedItem,
                            description: e.target.value,
                          })
                        }
                      />
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <input
                          type="number"
                          value={editedItem.amount}
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              amount: e.target.value,
                            })
                          }
                        />
                        <select
                          id="currency"
                          name="currency"
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              currency: e.target.value,
                            })
                          }
                        >
                          <option value="USD">USD</option>
                          <option value="SGD">SGD</option>
                          <option value="MYR">MYR</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                      <p>{contract.amount * exchangeRate} INR</p>
                      <input
                        type="date"
                        value={editedItem.date}
                        onChange={(e) =>
                          setEditedItem({ ...editedItem, date: e.target.value })
                        }
                      />
                      <button onClick={() => handleDelete(contract._id)}>
                        delete
                      </button>
                      <button onClick={() => handleUpdate(editedItem)}>
                        Update
                      </button>
                    </Contract>
                  );
                } else {
                  return (
                    <Contract key={index}>
                      <h5>{contract.description}</h5>
                      <p>
                        {contract.amount} {contract.currency}
                      </p>
                      <p>
                        {contract.amount * exchangeRateValue(contract.currency)}{" "}
                        INR
                      </p>
                      <p>{formatDateToDdMmYyyy(contract.date)}</p>
                      <button onClick={() => handleDelete(contract._id)}>
                        delete
                      </button>
                      <button onClick={() => handleEdit(contract)}>Edit</button>
                    </Contract>
                  );
                }
              })}
            </ContractDiv>
          ) : (
            <p>Loading data...</p>
          )}
          <InputForm onSubmit={handleSubmit}>
            {entries.map((entry, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Description"
                  value={entry.description}
                  onChange={(e) => {
                    const updatedEntries = [...entries];
                    updatedEntries[index].description = e.target.value;
                    setEntries(updatedEntries);
                  }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={entry.amount}
                  onChange={(e) => {
                    const updatedEntries = [...entries];
                    updatedEntries[index].amount = e.target.value;
                    setEntries(updatedEntries);
                  }}
                />
                <select
                  id="currency"
                  name="currency"
                  value={entry.currency}
                  onChange={(e) => {
                    const updatedEntries = [...entries];
                    updatedEntries[index].currency = e.target.value;
                    setEntries(updatedEntries);
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="SGD">SGD</option>
                  <option value="MYR">MYR</option>
                  <option value="INR">INR</option>
                </select>
                <input
                  type="date"
                  value={entry.date}
                  defaultValue={entry.date}
                  onChange={(e) => {
                    const updatedEntries = [...entries];
                    updatedEntries[index].date = e.target.value;
                    setEntries(updatedEntries);
                  }}
                />
              </div>
            ))}
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button type="button" onClick={handleAddEntry}>
              Add another transaction
            </button>
            <button type="submit">Save Data</button>
          </InputForm>
        </Grid>
      </div>
    </main>
  );
};
export default Home;

const Grid = styled.div`
  margin-top: 60px;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 20px;
`;
const ContractDiv = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #fff;
  width: fit-content;
  height: fit-content;
`;
const Contract = styled.div`
  border-bottom: 1px solid #fff;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr 1fr;
  h5 {
    padding: 10px;
  }
  p {
    text-align: right;
    padding: 10px;
    border-left: 1px solid #fff;
  }
  button {
    border-left: 1px solid #fff;
  }
`;
const InputForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  input {
    height: 20px;
  }
  button {
    height: 20px;
  }
`;
