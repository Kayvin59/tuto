import Web3 from 'web3';
import { Bubble, bubbleProviders, Delegation, encryptionPolicies, userManagers, toEthereumSignature, toDelegateSignFunction } from '@bubble-protocol/client';
import { ContentId } from '@bubble-protocol/core';
import { ecdsa } from '@bubble-protocol/crypto';


// Identify your bubble
const bubbleId = new ContentId({
  chain: 1,
  contract: "0x0585837C6210cFd4C97fc975704aeBa0aEDb47a2",   // replace with your contract address
  provider: 'https://vault.bubbleprotocol.com/v2/ethereum'  // configure for your off-chain storage service
});

// Create a new private key for this device (store it in your app or, if browser based, in local storage)
const deviceKey = new ecdsa.Key();

// Delegate the device key to act as your wallet account when accessing just this bubble for 1 year
const delegation = new Delegation(deviceKey.address, Date.now()/1000+60*60*24*365);
delegation.permitAccessToBubble(bubbleId);

// Sign the delegation using your wallet key
const web3 = new Web3(window.ethereum);  // configure to your provider's url or use a different signing strategy
const accounts = await web3.eth.getAccounts();
await delegation.sign((hash) => {
  return web3.eth.sign(hash, accounts[0])
  .then(toEthereumSignature)
})

// Construct a `BubbleProvider` appropriate to the API of the remote storage system.
const storageProvider = new bubbleProviders.HTTPBubbleProvider(bubbleId.provider);

// Define the encryption policy for the bubble
const encryptionPolicy = new encryptionPolicies.AESGCMEncryptionPolicy();

// Define a user manager so that friends and family can retrieve the encryption key
const userManager = new userManagers.MultiUserManager(deviceKey);

// Construct the `Bubble` class
const bubble = new Bubble(
  bubbleId, 
  storageProvider, 
  toDelegateSignFunction(deviceKey.signFunction, delegation), 
  encryptionPolicy, 
  userManager
);

// Create the bubble on the off-chain storage service.
await bubble.create();

console.log("Bubble created!");
console.log("bubble:", bubble);