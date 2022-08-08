import { useEffect, useMemo, useState } from 'react'
import logo from './logo.svg';
import styles from './styles.module.css';

const chains = [
  {
    name: 'Ethereum Mainet',
    chainId: 1,
    symb: 'ETH',
    explorer: 'https://etherscan.io'
  },
  {
    name: 'Goerli Test Network',
    chainId: 5,
    symb: 'GoerliETH',
    explorer: 'https://goerli.etherscan.io',
  }
]

function App() {

  const [ walletAccount, setWalletAccount ] = useState('')
  const [ currentChainId, setCurrentChainId ] = useState(null)
  const [ isConnected, setIsConnected ] = useState(false)
  const [ ethBalance, setEthBalance ] = useState(null)


  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
          setWalletAccount(accounts[0])
        })

        window.ethereum.on('chainChanged', (chaindId) => {
          setCurrentChainId(parseInt(chaindId, 16))
        })

    } else {
      alert(' MetaMask is not installed!')
    }
  }, [])


  const currectChain = useMemo(() => {
    console.log('currentChainId', currentChainId)
    const chain  = chains.find((chain) => chain.chainId === currentChainId)

    return chain
      ? chain
      : {
        name: 'Unknown Chain',
        chainId: currentChainId,
        symb: 'Native token',
        explorer: null
      }
  }, [currentChainId])

  useEffect(() => {
    console.log('walletAccount', walletAccount)
    console.log('currentChainId', currentChainId)
  }, [walletAccount, currentChainId])

  useEffect(() => {
    setIsConnected(walletAccount ? true : false)
  }, [walletAccount])

  const handleConnectWallet = async () => {
    console.log('Connecting ...')

    if (!window.ethereum) return

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]

    console.log('Account: ', account)
    setWalletAccount(account)
    setCurrentChainId(parseInt(window.ethereum.chainId, 16))
  }

  const handleDisconnect = async () => {
    console.log('Disconnecting...')
    setIsConnected(false)
    setWalletAccount('')
    setCurrentChainId(null)
  }

  const getBalance = async (walletAddress) => {
    console.log('loading balance...')

    if (!window.ethereum) return

    const balanceHex  = await window.ethereum.request({ method: 'eth_getBalance' , params: [ walletAddress, 'latest' ]})

    const wei = parseInt(balanceHex, 16)

    const eth = (wei / Math.pow(10, 18))// parse to ETH

    setEthBalance({ eth })
  }

  useEffect(() => {
    if (!walletAccount) return

    const timerId = setInterval(() => {
      getBalance(walletAccount)
    }, 1000)

    return () => clearInterval(timerId)
  }, [walletAccount])

  return (
    <div className={styles.App}>
      <header className={styles.App__container}>
        <div className={styles.section}>Wallet account: <div>{walletAccount}</div></div>

        {currectChain && (
          <div className={styles.section}>
            <div>Current chain:</div>
            <div>{currectChain.name}
              {currectChain.name !== 'Unknown Chain' && (
                <div> view account in 
                  <a href={`${currectChain.explorer}/address/${walletAccount}`} target='_blank'> explorer</a>
                </div>
              )}
            </div>
          </div>
        )}

        {ethBalance && (
          <div className={styles.section}>
            <div>
                <div>Balance: { ethBalance?.eth % 1 != 0 ? ethBalance?.eth.toFixed(4) : ethBalance?.eth} {currectChain.symb}</div>
            </div>
          </div>
        )}

        {isConnected
          ? (
            <div className={styles.dsiconnectButton} onClick={() => handleDisconnect()}>disconnect</div>
          )
          : (
            <div className={styles.connectButton} onClick={() => handleConnectWallet()}>connect</div>
          )
        }   
      </header>
    </div>
  );
}

export default App