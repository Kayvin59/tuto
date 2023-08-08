"use client"

import { FormEvent, useEffect, useState } from 'react'
import Web3 from 'web3'
import { TaskContractAddress } from '../config.js'
import TasksList from '../../build/contracts/TasksList.json'

const abi = TasksList.abi

export default function BubblePage() {
    const [isConnected, setIsConnected] = useState(false)
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [taskcontent, setTaskcontent] = useState<string>('');
    const [tasks, setTasks] = useState<{ content: string | null; isDeleted: boolean }[]>([]);

    const connectWallet = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Get MetaMask!");
                // Add state to handle correct network
                return;
            }
            let chainId = await ethereum.request({ method: "eth_chainId" });
            console.log('chainId:', chainId);
            const web3 = new Web3(window.ethereum);
            

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log("accounts:", accounts[0]);
            setIsConnected(true);
            setAccount(accounts[0]);

            const balanceInWei = await web3.eth.getBalance(accounts[0]);
            const balanceInEth = web3.utils.fromWei(balanceInWei, "ether");
            setBalance(balanceInEth);

        } catch (err) {
            console.error("Failed to connect:", err);
        }
    }

    const addTask = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        let task = {
            content: taskcontent,
            isDeleted: false
        }
        
        try {
            const { ethereum } = window;
            if (ethereum) {
                const web3Provider = new Web3(ethereum);
                const TaskContract = new web3Provider.eth.Contract([
                  {
                    "anonymous": false,
                    "inputs": [
                      {
                        "indexed": false,
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                      },
                      {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "TaskId",
                        "type": "uint256"
                      }
                    ],
                    "name": "AddTask",
                    "type": "event"
                  },
                  {
                    "anonymous": false,
                    "inputs": [
                      {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "TaskId",
                        "type": "uint256"
                      },
                      {
                        "indexed": false,
                        "internalType": "bool",
                        "name": "isDeleted",
                        "type": "bool"
                      }
                    ],
                    "name": "DeleteTask",
                    "type": "event"
                  },
                  {
                    "inputs": [
                      {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                      }
                    ],
                    "name": "taskToOwner",
                    "outputs": [
                      {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                      }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                  },
                  {
                    "inputs": [
                      {
                        "internalType": "string",
                        "name": "content",
                        "type": "string"
                      },
                      {
                        "internalType": "bool",
                        "name": "isDeleted",
                        "type": "bool"
                      }
                    ],
                    "name": "addTask",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  },
                  {
                    "inputs": [],
                    "name": "getMyTasks",
                    "outputs": [
                      {
                        "components": [
                          {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                          },
                          {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                          },
                          {
                            "internalType": "bool",
                            "name": "isDeleted",
                            "type": "bool"
                          }
                        ],
                        "internalType": "struct TaskList.Task[]",
                        "name": "",
                        "type": "tuple[]"
                      }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                  },
                  {
                    "inputs": [
                      {
                        "internalType": "uint256",
                        "name": "taskId",
                        "type": "uint256"
                      },
                      {
                        "internalType": "bool",
                        "name": "isDeleted",
                        "type": "bool"
                      }
                    ],
                    "name": "deleteTask",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }
                ], TaskContractAddress);
                  console.log("TaskContract:", TaskContract);          

                
                // Call the function of the smart contract first
                const tasksBoard = await TaskContract.methods.getMyTasks().call();
    
                TaskContract.methods.addTask(task.content, task.isDeleted)
                  .send({ from: account })
                  // Listen for the transaction hash to know when the transaction is mined/confirmed
                  .on('transactionHash', (hash: any) => {
                      console.log('Transaction hash:', hash);
                  })
                  .on('receipt', (receipt: any) => {
                      console.log('Transaction receipt:', receipt);
                      
                      // Update the tasks array with the new task
                      const newTask = {
                          content: task.content,
                          isDeleted: task.isDeleted,
                      };
                      setTasks([...tasks, newTask]);
                      console.log("Added task:", newTask);
                      console.log("Added task:", tasks);
                  })
                  .on('error', (error: any) => {
                      console.error('Error adding task:', error);
                  });
            }
        } catch (err) {
            console.error("Failed to add task:", err);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaskcontent(e.target.value);
    }

    useEffect(() => {
      connectWallet();
    })

  return (
    <div>
        <h1 className='text-center mb-2'>Hello</h1>
        {isConnected ? (
            <>
              <p className="text-gray-700">Your account address is: {account}</p>
              <p className="text-gray-700">Your balance is: {balance} SepoliaETH</p>
            </>
        ) : (
            <>
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                    onClick={connectWallet}
                >
                    Connect
                </button>
            </>
        )}
        <div className='my-4'>
          <h2>Tasks:</h2>
          <form onSubmit={handleSubmit}>
              <input type="text" value={taskcontent} onChange={handleChange} />
              <button onClick={addTask}>Add task</button>
          </form>
          <ul>
            {tasks.map((task) => (
              <li key={task.content}>task: {task.content}</li>
            ))}
          </ul>
        </div>
    </div>
  )
}
