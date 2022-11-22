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
import network from "../utils/network";
import { useRouter } from "next/router";
import Header from "../components/Header";
import React, { useState, FormEvent} from "react";
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";

type Props = {}

function Create({}:Props) {
  const address = useAddress()
  const router = useRouter()

  const [selectedNFT, setSelectedNFT] = useState<NFT>()

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  )

  const { contract: collectioncontract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  )

  const ownedNFT = useOwnedNFTs(
    collectioncontract,
    address
  )

  const networkMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  const {
    mutate: createDirectListing, 
    isLoading: isLoadingDirect, 
    error: errorDirect,
  } = useCreateDirectListing(contract)
  
  const {
    mutate: createAuctionListing, 
    isLoading, 
    error,
  } = useCreateAuctionListing(contract)

  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (networkMismatch) {
      switchNetwork && switchNetwork(network)
      return
    }

    if (!selectedNFT) return

    const target = e.target as typeof e.target & {
      elements: { listingType: {value: string}, price: {value: string}}
    }

    const{listingType, price} = target.elements

    if (listingType.value === 'directListing') {
      createDirectListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        tokenId: selectedNFT.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 Semana
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date()
      }, {
        onSuccess(data, variables, context) {
          console.log("SUCCESS: ", data, variables, context)
          router.push("/")
        },
        onError(error, variables, context) {
          console.log("ERROR: ", error, variables, context)
        }
      })
    }

    if (listingType.value === 'auctionListing') {
      createAuctionListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        buyoutPricePerToken: price.value,
        tokenId: selectedNFT.metadata.id,
        startTimestamp: new Date(),
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 Semana
        quantity: 1,
        reservePricePerToken: 0,
      }, {
        onSuccess(data, variables, context) {
          console.log("SUCCESS: ", data, variables, context)
          router.push("/")
        },
        onError(error, variables, context) {
          console.log("ERROR: ", error, variables, context)
        }
      })
    }
  }

  return(
    <div>
      <Header  />
      
      <main className="max-w-6xl mx-auto p-10 pt-2" >
        <h1 className="text-4xl font-bold" >List an Item</h1>
        <h2 className="text-xl font-semibold pt-5" >Select an Item you would like to Sell</h2>

        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>
      
        <div className="flex overflow-x-scroll space-x-2 p-4" >
          {ownedNFT?.data?.map(nft => (
            <div 
              key={nft.metadata.id}
              onClick={() => setSelectedNFT(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                nft.metadata.id === selectedNFT?.metadata.id 
                  ? "border-black"
                  : "border-transparent"
              } `}
            >
              <MediaRenderer 
                className="h-48 rounded-lg"
                src={nft.metadata.image} 
              />
              <p className="text-lg truncate font-bold" >{nft.metadata.name}</p>
              <p className="text-xs truncate" >{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNFT && (
          <form onSubmit={handleCreateListing} >
            <div className="flex flex-col p-10" >
              <div className="grid grid-cols-2 gap-5" >
                <label className="border-r font-light" >Direct Listing / Fixed Price</label>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="directListing" 
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light" >Auction</label>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="auctionListing" 
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light" >Price</label>
                <input 
                  type="text"
                  name="price"
                  placeholder="0.005"
                  className="bg-gray-100 p-5"
                />
              </div>

              <button className="bg-blue-600 text-white rounded-lf p-4 mt-8" type="submit" >Create Listing</button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
} 

export default Create