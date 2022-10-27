import React from 'react'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react"

type Props = {}

function Header ( {}: Props ) {
  // Simple and handy hooks from thirdweb
  const address = useAddress()
  const disconnect = useDisconnect()
  const connectWithMetamask = useMetamask()

  return (
    <div>
      <nav>
        <div>
          {address ? (
            <button onClick={disconnect} className='connectWalletBtn'> 
              Hi, {address.slice(0, 5) + "..." + address.slice(-4)}
            </button>
          ) : (
            <button onClick={ connectWithMetamask } className="connectWalletBtn">
              Connect your Wallet
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Header