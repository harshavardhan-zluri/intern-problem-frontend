"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import styles from "../app/page.module.css";
import styled from 'styled-components';
import Papa from 'papaparse';

const Home= () => {
  const [data, setData] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [entries, setEntries] = useState([]);
  const [convertedJsonData, setConvertedJsonData] = useState(null);

  const handleAddEntry = () => {
    setEntries([...entries, { description: '', amount: '' }]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/apiTrial/');
        const jsonData = await response.json();
        console.log(jsonData)
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/apiTrial/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entries),
      });

      const data = await response.json();
      console.log(data); // Handle the response data as needed

      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:3000/apiTrial/');
          const jsonData = await response.json();
          console.log(jsonData)
          setData(jsonData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
      setEntries([])
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      complete: (result) => {
        // result.data contains the parsed CSV data
        console.log('Parsed CSV data:', result.data);
        setConvertedJsonData(result.data);
        console.log(convertedJsonData)
        var finalArray = [...entries,...result.data]
        setEntries(finalArray)
      },
      header: true, // Assumes the first row contains column headers
    });
  };

  return (
    <main className={styles.main}>
    <div>
      <h1>API Data</h1>
      <Grid>
      {data ? (
        <ContractDiv>{data.map((contract, index)=>{
          return(
            <Contract key={index}>
              <h5>{contract.description}</h5>
              <p>{contract.amount}</p>
            </Contract>
          )
        }
          )}</ContractDiv>
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
        </div>
      ))}
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button type="button" onClick={handleAddEntry}>
        Add another expense
      </button>
      <button type="submit">Save Data</button>
    </InputForm>
      </Grid>
      </div>
    </main>
  );
}
export default Home

const Grid = styled.div`
margin-top:60px;
display:grid;
grid-template-columns:1fr 1fr;
grid-gap:20px;
`
const ContractDiv = styled.div`
display:flex;
flex-direction:column;
border:1px solid #FFF;
width:fit-content;
height:fit-content;
`
const Contract = styled.div`
border-bottom:1px solid #FFF;
    display: grid;
    grid-template-columns: 2fr 1fr;
h5{
  padding:10px;
  border-right:1px solid #FFF;
}
p{
  padding:10px;
}
`
const InputForm = styled.form`
display:flex;
flex-direction:column;
gap:10px;
input{
  height:20px;

}
button{
  height:20px;
}
`