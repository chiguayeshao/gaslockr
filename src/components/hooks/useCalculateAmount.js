import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import contracABI from "../../contractABI.json";
import contractAddress from "../../contractAddress.json";

export function useCalculateAmount() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const calculateAmount = useCallback(async (userAddress, txHash, orderType) => {
        setError(null);
        setResult(null);

        const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/20133274396446b8bad41fef05006f4b');
        const privateKey = process.env.REACT_APP_PRIVATE_KEY
        const wallet = new ethers.Wallet(privateKey, provider);

        const baseGasPrice = ethers.utils.parseUnits('10', 'gwei');
        const floatRates = [2.5, 5, 10];
        const floatRate = floatRates[orderType];

        const transaction = await provider.getTransaction(txHash);
        console.log(transaction, 'transaction')

        // if (transaction.from.toLowerCase() !== userAddress.toLowerCase()) {
        //     setError('The transaction is not initiated by the provided user address.');
        //     return;
        // }

        const txGasPrice = transaction.gasPrice;
        // if (txGasPrice <= baseGasPrice) {
        //     setError('tx Gas price lower than base gas price.');
        //     return;
        // }

        const gasPriceDifference = txGasPrice.sub(baseGasPrice);
        const priceDifferenceRate = gasPriceDifference.mul(100).div(baseGasPrice);

        // if (priceDifferenceRate <= floatRate) {
        //     setError('Rate lower than the floatRate.');
        //     return;
        // }

        //amount in WEI
        const amount = priceDifferenceRate.sub(floatRate).mul(1000).div(20 - floatRate);

        const contract = new ethers.Contract(contractAddress, contracABI, wallet);
        await contract.claimNormal(userAddress, amount);

        setResult({ success: true, amount });

    }, []);

    return { calculateAmount, result, error };
}