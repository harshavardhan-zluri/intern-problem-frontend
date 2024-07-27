"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import styled from "styled-components";
import Papa from "papaparse";
import axios from "axios";
import Popup from "reactjs-popup";
import "./popup.css";

const Home = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [data, setData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null)
  const [amount, setAmount] = useState("");
  const [allSelected, setAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [convertedJsonData, setConvertedJsonData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(80);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [newItem, setNewItem] = useState({});

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

  const getDataQuery = () => {const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/apiTrial/");
        const jsonData = await response.json();
        // console.log(jsonData);
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }
    
  useEffect(() => {
    getDataQuery();
  }, []);

  // Add one popup below

  const handleSaveOneEntry = async (e, close) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/apiTrial/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();
      setApiResponse(data);
      // console.log(data); // Handle the response data as needed

      getDataQuery();
      setNewItem({});
      close();
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // Edit one transaction below:

  const handleEditOneEntry = async (e, close) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/apiTrial/${editedItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedItem),
      });

      const data = await response.json();
      setApiResponse(data);
      // console.log(data); // Handle the response data as needed

      getDataQuery();
      setEditedItem({});
      close();
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // uplaod csv below 
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFile = async() => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      axios.post('http://localhost:3000/apiTrial/csv', formData)
        .then((response) => {
          console.log('File uploaded successfully:', response.data);
          // Handle any further actions (e.g., display success message)
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          // Handle error (e.g., display error message)
        });
    }
  };
  const handleUploadCsv = async (e, close) => {
    // e.preventDefault();
    setUploadStatus("Validating")
    console.log(selectedFile)
    if (selectedFile) {
      const formData = new FormData();
      
      // Append the file with the key "csvFile"
      formData.append('csvFile', selectedFile); 
      console.log(formData.get('csvFile'))
      // Add any other key-value pairs if needed
      // formData.append('otherKey', 'otherValue');

      try {
        const response = await fetch("http://localhost:3000/apiTrial/csv", {
          method: "POST",
          headers: {
            
          },
          body: formData,
        });

        const data = await response.json();
        setUploadStatus(data.message);
        // console.log(data); // Handle the response data as needed
  
        getDataQuery();
      
      } catch (error) {
        console.error('Network error:', error);
        // Handle network-related errors
      }
    }
  }

  const handleCloseCsv = (e, close)=>{
    close();
    setUploadStatus(null);
    setSelectedFile(null);
  }

  const handleEdit = (item) => {
    setEditedItem(item);
  };

  const handleDelete = async (itemId, close) => {
    try {
      // Send DELETE request to your API (replace with your actual API endpoint)
      await fetch(`http://localhost:3000/apiTrial/${itemId}`, {
        method: "DELETE",
      });
      close();

      // Update state to remove the deleted item
      getDataQuery();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Delete many here 

  const handleDeleteMany = async (ids, close) => {
    try {
      // Send DELETE request to your API (replace with your actual API endpoint)
      await fetch(`http://localhost:3000/apiTrial/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      });
      setSelectedIds([]);
      setAllSelected(false)
      close();

      // Update state to remove the deleted item
      getDataQuery();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCheckboxChange = (id) => {
    if(selectedIds.some((item) => item._id === id)){
      setSelectedIds(selectedIds.filter((item) => item._id !== id));
      
    }
    else{
      setSelectedIds([...selectedIds, { _id: id }])
    }
    // console.log(selectedIds)
  };

  const handleAllCheckbox = (e) => {
    if(allSelected){
      setSelectedIds([])
      setAllSelected(false)
    }
    else{
      setSelectedIds(data.map((item) => ({ _id: item._id })));
      setAllSelected(true)
    }

  }
    const handleAllCheckboxTick = async (e) => {
     await  (selectedIds.length===data.length?
        setAllSelected(true)
      :
      
        setAllSelected(false)
     )

  };
  

  function formatDateToDdMmYyyy(dateString) {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
  function formatDateToYyyyMmDd(dateString) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = date.getUTCDate().toString().padStart(2, "0");
  
    return `${year}-${month}-${day}`;
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
  function currencySymbol(currency) {
    switch (currency) {
      case "USD":
        return "$";
        break;
      case "MYR":
        return "RM";
        break;
      case "SGD":
        return "S$";
        break;
      default:
        return "₹";
    }
  }

  return (
    <div>
      <div style={{ position: "sticky", top: "0px" }}>
        <NavBar>
          Nav 
          {/* <button onClick={()=>console.log(selectedIds)}>Check</button> */}
          </NavBar>
      </div>
      <main className={styles.main}>
        <div style={{width:"100%", maxWidth:"1216px"}}>
          <TableDiv>
            <TableHeading>
              <h3>Transactions</h3>
              <ActionButtons>
                {selectedIds.length!=0 &&
              <Popup
                  trigger={
                    selectedIds.length===1?
                    <PrimaryButton type="button">Delete</PrimaryButton>
                    :
                    <PrimaryButton type="button">Delete All</PrimaryButton>
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <PopupDiv>
                      <PopupTitleDiv>
                        <h3> Delete </h3>
                        <button onClick={close}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                              fill="black"
                              fill-opacity="0.6"
                            />
                          </svg>
                        </button>
                      </PopupTitleDiv>
                      <PopupInputDivCSV>
                        <p>Do you want to remove all {selectedIds.length} items?</p>
                      </PopupInputDivCSV>
                      <PopupButtonDiv>
                        <ActionButtons>
                          <SecondaryButton
                            onClick={close}
                          >
                            Cancel
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => handleDeleteMany(selectedIds, close)}
                          >
                            Delete
                          </PrimaryButton>
                        </ActionButtons>
                      </PopupButtonDiv>
                    </PopupDiv>
                  )}
                </Popup>
                }
                <Popup
                  trigger={<SecondaryButton>Upload CSV</SecondaryButton>}
                  modal
                  nested
                >
                  {(close) => (
                    <PopupDiv>
                      <PopupTitleDiv>
                        <h3> Upload CSV </h3>
                        <button onClick={(e)=>handleCloseCsv(e, close)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                              fill="black"
                              fill-opacity="0.6"
                            />
                          </svg>
                        </button>
                      </PopupTitleDiv>
                      <PopupInputDivCSV>
                      {uploadStatus==="Successful"?
                        (
                          <div style={{textAlign:"center"}}>
                            <p>{selectedFile.name}</p>
                            <p>Upload Successful</p>
                          </div>
                          
                        ):
                        selectedFile===null?
                        (
                        <p>Select and upload your csv here</p>
                          )
                          :
                          (
                            <p>{selectedFile.name}</p>
                          )
                        }
                        <input type="file" id="csv-upload" name="csv-upload"  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange}></input>
                        {uploadStatus==="Successful"?
                        (
                          
                          <PrimaryButton
                          onClick={(e)=>handleCloseCsv(e, close)}
                        >
                          
                          Done
                        </PrimaryButton>
                        ):
                        selectedFile===null?
                        (
                        <label for="csv-upload" >
                          <PrimaryButton>
                           Upload
                          </PrimaryButton>
                          </label>
                          )
                          :
                          uploadStatus==null?
                          (<PrimaryButton
                            onClick={handleUploadCsv}
                          >
                            
                            Validate
                          </PrimaryButton>
                          )
                          :
                        (
                          <PrimaryButton>
                           Validating...
                          </PrimaryButton>
                        )
                        }
                      </PopupInputDivCSV>
                    </PopupDiv>
                  )}
                </Popup>
                <Popup
                  trigger={
                    <PrimaryButton type="button">Add Transaction</PrimaryButton>
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <PopupDiv>
                      <PopupTitleDiv>
                        <h3> Add Transaction </h3>
                        <button onClick={close}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                              fill="black"
                              fill-opacity="0.6"
                            />
                          </svg>
                        </button>
                      </PopupTitleDiv>
                      <PopupInputDiv>
                        <input
                          type="text"
                          placeholder="Transaction Description"
                          value={newItem?.description}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              description: e.target.value,
                            })
                          }
                        />
                        <ActionButtons>
                          <select
                            style={{ width: "96px" }}
                            id="currency"
                            name="currency"
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                currency: e.target.value,
                              })
                            }
                          >
                            <option value="USD">USD</option>
                            <option value="SGD">SGD</option>
                            <option value="MYR">MYR</option>
                            <option value="INR">INR</option>
                          </select>
                          <input
                            style={{ width: "204px" }}
                            type="number"
                            value={newItem?.amount}
                            placeholder="Original Amount"
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                amount: e.target.value,
                              })
                            }
                          />
                        </ActionButtons>
                        <input
                          style={{ textTransform: "uppercase" }}
                          type="date"
                          value={newItem?.date}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              date: e.target.value,
                            })
                          }
                        />
                      </PopupInputDiv>
                      <PopupButtonDiv>
                        <ActionButtons>
                          <SecondaryButton
                            onClick={() => {
                              close() + setNewItem({});
                            }}
                          >
                            Cancel
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={(e) => handleSaveOneEntry(e, close)}
                          >
                            Save
                          </PrimaryButton>
                        </ActionButtons>
                      </PopupButtonDiv>
                    </PopupDiv>
                  )}
                </Popup>
              </ActionButtons>
            </TableHeading>

            <Grid>
              <Contract style={{ background: "#F6F6F6" }}>
                <input type="checkbox" checked={allSelected} onChange={(e)=>handleAllCheckbox(e)} />
                <h5>Date</h5>
                <h5>Transaction Description</h5>
                <h5>Original Amount</h5>
                <h5>Amount in INR</h5>
                <h5></h5>
                <h5></h5>
              </Contract>
              {data ? (
                <ContractDiv>
                  {data.map((contract, index) => {
                    return (
                      <Contract key={index}>
                        <input type="checkbox" 
                        checked={selectedIds.some((item) => item._id === contract._id)}
                        onChange={()=>handleCheckboxChange(contract._id)}/>
                        <p>{formatDateToDdMmYyyy(contract.date)}</p>
                        <p>{contract.description}</p>
                        <p>
                        {contract.currency} {contract.amount} 
                        {/* {currencySymbol(contract.currency)} {contract.amount}  */}
                        </p>
                        <p>
                        ₹{" "}{(contract.amount *
                            exchangeRateValue(contract.currency)).toFixed(2)}
                        </p>
                        <Popup
                          trigger={
                            <button>
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.5 19.4998H5.6L16.675 8.4248L15.575 7.3248L4.5 18.3998V19.4998ZM19.85 7.3498L16.65 4.1498L17.7 3.0998C17.9833 2.81647 18.3333 2.6748 18.75 2.6748C19.1667 2.6748 19.5167 2.81647 19.8 3.0998L20.9 4.1998C21.1833 4.48314 21.325 4.83314 21.325 5.2498C21.325 5.66647 21.1833 6.01647 20.9 6.2998L19.85 7.3498ZM18.8 8.3998L6.2 20.9998H3V17.7998L15.6 5.1998L18.8 8.3998ZM16.125 7.8748L15.575 7.3248L16.675 8.4248L16.125 7.8748Z"
                                  fill="black"
                                  fill-opacity="0.87"
                                />
                              </svg>
                            </button>
                          }
                          modal
                          nested
                          onOpen={()=>handleEdit(contract)}
                        >
                          {(close) => (
                            <PopupDiv>
                              <PopupTitleDiv>
                                <h3> Edit Transaction </h3>
                                <button onClick={close}>
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                                      fill="black"
                                      fill-opacity="0.6"
                                    />
                                  </svg>
                                </button>
                              </PopupTitleDiv>
                              <PopupInputDiv>
                                <input
                                  type="text"
                                  placeholder="Transaction Description"
                                  value={editedItem?.description}
                                  onChange={(e) =>
                                    setEditedItem({
                                      ...editedItem,
                                      description: e.target.value,
                                    })
                                  }
                                />
                                <ActionButtons>
                                  <select
                                    style={{ width: "96px" }}
                                    id="currency"
                                    name="currency"
                                    value={editedItem?.currency}
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
                                  <input
                                    style={{ width: "204px" }}
                                    type="number"
                                    value={editedItem?.amount}
                                    placeholder="Original Amount"
                                    onChange={(e) =>
                                      setEditedItem({
                                        ...editedItem,
                                        amount: e.target.value,
                                      })
                                    }
                                  />
                                </ActionButtons>
                                <input
                                  style={{ textTransform: "uppercase" }}
                                  type="date"
                                  value={formatDateToYyyyMmDd(editedItem?.date)}
                                  onChange={(e) =>
                                    setEditedItem({
                                      ...editedItem,
                                      date: e.target.value,
                                    })
                                  }
                                />
                              </PopupInputDiv>
                              <PopupButtonDiv>
                                <ActionButtons>
                                  <SecondaryButton
                                    onClick={() => {
                                      close() + setEditedItem({});
                                    }}
                                  >
                                    Cancel
                                  </SecondaryButton>
                                  <PrimaryButton
                                    onClick={(e) =>
                                      handleEditOneEntry(e, close)
                                    }
                                  >
                                    Save
                                  </PrimaryButton>
                                </ActionButtons>
                              </PopupButtonDiv>
                            </PopupDiv>
                          )}
                        </Popup>
                        <Popup
                  trigger={
                    <button onClick={() => handleDelete(contract._id)}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.525 21C6.10833 21 5.75417 20.8542 5.4625 20.5625C5.17083 20.2708 5.025 19.9167 5.025 19.5V5.25H4V3.75H8.7V3H15.3V3.75H20V5.25H18.975V19.5C18.975 19.9 18.825 20.25 18.525 20.55C18.225 20.85 17.875 21 17.475 21H6.525ZM17.475 5.25H6.525V19.5H17.475V5.25ZM9.175 17.35H10.675V7.375H9.175V17.35ZM13.325 17.35H14.825V7.375H13.325V17.35ZM6.525 5.25V19.5V5.25Z"
                              fill="black"
                              fill-opacity="0.87"
                            />
                          </svg>
                        </button>
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <PopupDiv>
                      <PopupTitleDiv>
                        <h3> Delete Transaction </h3>
                        <button onClick={close}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                              fill="black"
                              fill-opacity="0.6"
                            />
                          </svg>
                        </button>
                      </PopupTitleDiv>
                      <PopupInputDivCSV>
                        <p>Are you sure you want to delete this transaction:</p><br/>
                        <p>{contract.description} : {contract.amount} {contract.currency}</p>
                      </PopupInputDivCSV>
                      <PopupButtonDiv>
                        <ActionButtons>
                          <SecondaryButton
                            onClick={close}
                          >
                            Cancel
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => handleDelete(contract._id, close)}
                          >
                            Delete
                          </PrimaryButton>
                        </ActionButtons>
                      </PopupButtonDiv>
                    </PopupDiv>
                  )}
                </Popup>
                        
                      </Contract>
                    );
                  })}
                </ContractDiv>
              ) : (
                <p>Loading data...</p>
              )}
            </Grid>
            {/* <APIResponse>
              {apiResponse ? (
                <h3>{apiResponse.message}</h3>
              ) : (
                <h3>Hello World</h3>
              )}
            </APIResponse> */}
          </TableDiv>
          {data?.length==0 && (
            <NoDataDiv>
            <h2>No data available</h2>
            </NoDataDiv>
          )}
        </div>
      </main>
    </div>
  );
};
export default Home;

const APIResponse = styled.div`
  h3 {
    color: #000;
  }
`;
const NavBar = styled.div`
  background: #3d81f6;
  padding: 14px;
  top: 0px;
  position: sticky;
`;
const TableDiv = styled.div`
  background: #ffffff;
`;
const TableHeading = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 16px;
  h3 {
    font-size: 16px;
    color: #666666;
  }
`;
const ActionButtons = styled.div`
  display: flex;
  flex-direction: row;
  width: max-content;
  gap: 10px;
`;

const PrimaryButton = styled.div`
  padding: 10px 14px;
  font-size: 14px;
  text-transform: uppercase;
  color: #ffffff;
  background: #6200ee;
  border: 1px solid #6200ee;
  border-radius: 4px;
  width: fit-content;
  &:hover {
    background: #ffffff;
    cursor: pointer;
    color: #6200ee;
  }
`;
const SecondaryButton = styled.div`
  padding: 10px 14px;
  font-size: 14px;
  text-transform: uppercase;
  color: #6200ee;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  &:hover {
    border: 1px solid #6200ee;
    cursor: pointer;
  }
`;

const Grid = styled.div``;
const ContractDiv = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #fff;
  width: fit-content;
  height: fit-content;
  width: 100%;
`;
const Contract = styled.div`
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 1fr 2fr 6fr 3fr 3fr 1fr 1fr;
  h5 {
    color: #212121;
    padding: 10px;
  }
  p {
    text-align: left;
    padding: 10px;
    color: #212121;
  }
  button {
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
    background: transparent;
    border: none;
    &:hover {
      background: #e6e6e6;
    }
  }
  input {
    background: #ffffff;
    outline: 1px solid black;
    margin: 10px;
    color: #1c1c1f;
  }
  input[type="checkbox"] {
    height: 18px;
    width: 18px;
    outline: 2px solid #666666;
    border: none;
    border-radius: 2px;
    background: #ffffff;
  }
`;
const InputForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  input {
    height: 20px;
  }
  button {
    height: 20px;
  }
`;

const PopupDiv = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  max-width: 336px;
  input {
    height: 40px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: #909090;
    padding: 12px;
    &:active {
      color: #000;
    }
  }
  select {
    height: 40px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: #1c1c1f;
    padding: 12px;
    &:active {
      color: #000;
    }
  }
`;
const PopupTitleDiv = styled.div`
  background: #f6f6f6;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 16px;
  width: 100%;
  border-bottom: 1px solid #b0b0b0;
  button {
    margin: -8px;
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
    background: transparent;
    border: none;
    &:hover {
      background: #e6e6e6;
    }
    &:active {
      border: none;
    }
  }
  h3 {
    color: #b0b0b0 !important;
    font-weight:400;

  }
`;
const PopupInputDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 40px;
`;
const PopupButtonDiv = styled.div`
  text-align: right;
  text-align: -webkit-right;
  align-items: end;
  border-top: 1px solid #b0b0b0;
  padding: 12px 16px;
`;
const PopupButtonDivCSV = styled.div`
  text-align: center;
  text-align: -webkit-center;
  align-items: end;
  border-top: 1px solid #b0b0b0;
  padding: 12px 16px;
`;
const PopupInputDivCSV = styled.div`
height:210px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 40px;
  align-items:center;
    justify-content: center;
  p {
    color: #909090;
  }
    input {
    display:none;
    }

`
const NoDataDiv = styled.div`

width:fit-content;
margin:100px auto;
padding:40px;
border:1px solid #B9B9B9;
background:#FFF;
border-radius:16px;
h2{
color:#1C1C1F;
}

`