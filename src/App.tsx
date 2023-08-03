import React from 'react';
import logo from './logo.svg';
import './App.css';

import { TestOracle5 } from './contracts/testOracle5';
import {
    bsv,
    TestWallet,
    DefaultProvider,
    sha256,
    toByteString,
    toHex,
    PubKey,
    findSig,
    SignatureResponse,
    ByteString,
} from 'scrypt-ts'


import { RabinSig, RabinPubKey, RabinVerifierWOC } from 'scrypt-ts-lib'
import { generatePrivKey, privKeyToPubKey, sign, verify } from 'rabinsig'

function App() {
  const handleTestContract = async () => {
    // Read the private key from the .env file.
    // The default private key inside the .env file is meant to be used for the Bitcoin testnet.
    // See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
    const privateKey = bsv.PrivateKey.fromWIF(process.env.REACT_APP_PRIVATE_KEY || '')

    // Prepare signer.
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const signer = new TestWallet(
        privateKey,
        new DefaultProvider({
            network: bsv.Networks.testnet,
        })
    )
    // await TestOracle5.compile()

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1

    
    const key = {
        p: 2814015297002173515911792099514050754903060894643230059745767270555014452711294029953724549765934365804606426418393172072563368169125091317706017909563n,
        q: 650047001204168007801848889418948532353073326909497585177081016045346562912146630794965372241635285465610094863279373295872825824127728241709483771067n
      }
    console.log('key', key)

    const nRabin = privKeyToPubKey(key.p, key.q)
    console.log('nRabin', nRabin)

    const instance = new TestOracle5(
        PubKey(toHex(privateKey.publicKey)), 1n, nRabin
    )

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log(`Aaaa contract deployed: ${deployTx.id}`)

    const txUrl = `https://api.whatsonchain.com/v1/bsv/test/tx/${deployTx.id}/hex`;
    const response = await fetch(txUrl);
    const txRaw = await response.text();
    const tx = new bsv.Transaction();
    tx.fromString(txRaw);
    const current = TestOracle5.fromTx(tx, 0) as TestOracle5;
    await current.connect(signer);

    const msg: ByteString = toByteString('00112233445566778899aabbccddeeff')


    const signRes = sign(msg, key.p, key.q, nRabin)

    let paddingBytes: ByteString = ''

    for (let i = 0; i < signRes.paddingByteCount; i++) {
        paddingBytes += '00'
    }

    const sig: RabinSig = {
        s: signRes.signature,
        padding: paddingBytes,
    }

    const ok = verify(msg, signRes.paddingByteCount, signRes.signature, nRabin)

    console.log('ok', ok)
    // const {tx: callTx} = await instance.methods.lockStep1((sigResponses:  SignatureResponse[]) => {
    const {tx: callTx} = await current.methods.lockStep1((sigResponses:  SignatureResponse[]) => {
        return findSig(sigResponses, privateKey.publicKey)
    }, msg, sig)

    console.log(`Aaaa contract called: ${callTx.id}`)
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleTestContract}>
          Test Contract
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
