import React from "react";
import Header from "../components/Header";
import {
  useAddress, 
  useNetwork,
  useContract,
  useOwnedNFTs,
  MediaRenderer,
  useNetworkMismatch,
  useCreateDirectListing,
  useCreateAuctionListing,
} from "@thirdweb-dev/react"

type Props = {}

function Create({}:Props) {
  const address = useAddress()
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  )

  return(
    <div>
      <Header  />
      
    
    </div>
  )
} 

export default Create