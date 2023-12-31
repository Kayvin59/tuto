"use client"

import { FormEvent, useEffect, useState } from 'react'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { TaskContractAddress } from '../config.js'
import TasksList from '../../build/contracts/PublicBubble.json'

const TaskContractAbi: AbiItem[] = TasksList.abi as AbiItem[];

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

            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log("accounts:", accounts[0]);
            const balanceInWei = await web3.eth.getBalance(accounts[0]);
            const balanceInEth = web3.utils.fromWei(balanceInWei, "ether");

            setIsConnected(true);
            setAccount(accounts[0]);
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
                const web3Provider = new Web3(window.ethereum);
                const TaskContract = new web3Provider.eth.Contract(TaskContractAbi, TaskContractAddress);
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
                      setTaskcontent('');
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
    <div className='p-4'>
        <h1 className='text-center mb-2'>Hello</h1>
        {isConnected ? (
            <div className='flex flex-col border-b-2 pb-2'>
              <p className="flex flex-col items-center mb-2 text-gray-700">
                <span>
                  Your account address is: 
                </span>
                <span>
                  {account}
                </span>
              </p>
              <p className="flex flex-col items-center mb-2 text-gray-700">
                <span>
                  Your account balance is: 
                </span>
                <span>
                  {balance}
                </span>
              </p>
            </div>
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
          <form onSubmit={handleSubmit} className='flex mt-2'>
              <input type="text" value={taskcontent} onChange={handleChange} className='border p-1 flex-grow mr-2 rounded pl-1'/>
              <button onClick={addTask} className="bg-blue-500 text-white p-1 rounded">Add task</button>
          </form>
          <ul className='flex flex-col mt-6'>
            {tasks.map((task) => (
              <li key={task.content} className='w-full border border-slate-600 rounded-lg mb-2 cursor-pointer bg-white p-2'>{task.content}</li>
            ))}
          </ul>
        </div>
    </div>
  )
}
