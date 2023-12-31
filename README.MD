# Bubble Protocol Tuto 

Create a Bubble that will contain a private area for storing to-do list

## Bubble Protocol

Bubble Protocol provides access-controlled off-chain storage for Web3 applications and allows blockchains to govern private data. It adds Web3 capabilities to any storage system, whether a public relay server, decentralized storage network, home server, or private company infrastructure.

Bubble Protocol is blockchain agnostic and is designed to be highly adaptable, providing Web3 developers with an easy to use general purpose global data layer for data tokenisation, cross-device DApp storage, decentralised identity solutions, web3 privacy compliance solutions, paywalled content, NFT content, and much more.

Let’s see how this applies with a to-do list.

## Setup

- Install truffle and ganache-cli

```
npm i -g truffle
npm i -g ganache-cli
```

Create project structure by running `truffle init`.       
Start the ganache blockchain using `ganache-cli` in a separate terminal and let it run behind.      
Compile and deploy contract :  
> Use Public Bubble contract below and make the necessary changes.
```
truffle compile
truffle migrate
```

- Connect Metamask to ganache network.   

Add ganache network manually by entering "HTTP://127.0.0.1:8545", "1337" and "ETH" respectively with RPC URL, chain ID and currency symbol.    
Use a private key to import a new account.


( When using bubble tools )
- Install Bubble CLI
```
npm i -g @bubble-protocol/bubble-tools
```    


- Configure your blockchain providers
For personal development purposes you are free to use Bubble Protocol's providers:
```
curl https://vault.bubbleprotocol.com:8125/providers > ~/.bubble-tools/providers
```   
   

## Contract

Implement Access Control Contract.

```
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract PublicBubble is AccessControlledStorage{

  address owner = msg.sender;
  bool terminated = false;

  function getAccessPermissions( address /* user */, uint256 contentId ) override external view returns (uint256) {

        /**
         * If the bubble has been terminated, the off-chain storage service will delete the bubble and 
         * all its contents.
         */
        if (terminated) return BUBBLE_TERMINATED_BIT;

        /**
         * All directories within the bubble are public. Anyone can create one using identifier from 0 to 100
         */
        if (contentId <= 100) return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;

        /**
         * All files within the bubble are public. Anyone can read, write and append.
         */
        else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

    // Owner can terminate the bubble forcing the off-chain storage service to delete the bubble and its contents
    function terminate() external {
        require(msg.sender == owner, "permission denied");
        terminated = true;
    }

}
```
   

## Create and use bubble



**With Bubble class :**
    
        
Create a directory for frontend
```
mkdir front
cd front
```
    
Install Next JS and bubble protocole services
```
npx create-next-app@latest
npm i @bubble-protocol/client @bubble-protocol/core @bubble-protocol/server
```





**With Bubble tools :**

- Create a private key and save it to the wallet with the given label 

```
// create [label]
bubble wallet create tuto-key
```
You can check the list of wallet using `bubble wallet list`
 
> default-key     0xee...  
> initial-application-key 0xee...   
> tuto-key        0xdb...


- Add bubble servers on any blockchains or testnets (Base Goerli)

```
// add <label> <url>
bubble servers add bubble-server-tuto https://vault.bubbleprotocol.com/v2/base-goerli
```
You can check the list of servers using `bubble servers list`

> bubble-server-tuto     undefined       https://vault.bubbleprotocol.com/v2/base-goerli


- Create bubble

```
// create-bubble [options] <server> <contract>
bubble content create-bubble bubble-server-tuto 0xBf0869e0BFb96902BFa1b66b1C3bb0FC41a42b65
```

   

- Check if the user has permissions to read, write and append file to the bubble

```
// permissions [options] <server> <contract> [filename]
bubble content permissions bubble-server-tuto 0xBf0869e0BFb96902BFa1b66b1C3bb0FC41a42b65 1
```
> --rwa--
    
       

> [!NOTE]  
> File zero is reserved and means the root of the bubble itself. 
> Filename ≤ 100 are directories. Filename > 100 are files.

   

- Write data to bubble file

```
// write [options] <server> <contract> <filename> [file]
bubble content write bubble-server-tuto 0xBf0869e0BFb96902BFa1b66b1C3bb0FC41a42b65 1 -d "First task!"
```

You can read the content of the bubble by using `bubble content read bubble-server-tuto 0xBf0869e0BFb96902BFa1b66b1C3bb0FC41a42b65 1`
> First task!

   
