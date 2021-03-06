import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React from "react";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json'
import LoadingIndicator from './components';

// Constants
const TWITTER_HANDLE = 'kushagra_shiv';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://opensea.io/assets';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x9c788EDF35d32baC28bFff923b1e2430Ddba5cE6";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    const maticChainId = "0x89";
    if (chainId !== maticChainId) {
      alert("You are not connected to the Polygon Mainnet!");
      return;
    }
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found!");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);


      const maticChainId = "0x89";
      if (chainId !== maticChainId) {
        alert("You are not connected to the Polygon Mainnet!");
        return;
      }
      console.log("Connected to account:", accounts[0]);
      alert("Connected!");
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (err) {
      console.log(err);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });
        console.log("Setup Event Listener!");
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (err) {
      console.error(err);
    }
  }

  const askContractToMintNFT = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log("Goint to pop wallet to pay gas!");

        let txn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...");
        await txn.wait();
        console.log(`Mined! See transaction at: https://polygonscan.com/tx/${txn.hash}`);
        setIsLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected()
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">Mint NFT</button>}
          <div>{isLoading ? <LoadingIndicator /> : ''}</div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
