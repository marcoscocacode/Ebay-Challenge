import { useRouter } from "next/router";
import Header from "../../components/Header";
import { ListingType } from "@thirdweb-dev/sdk";
import React, { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid"
import { MediaRenderer, useContract, useListing } from "@thirdweb-dev/react";

function ListingPage() {
  const router = useRouter()
  const { listingId }  = router.query as { listingId: string }
  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string
    symbol: string
  }>()

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  )
  
  const { data: listings, isLoading, error } = useListing(contract, listingId)

  useEffect(() => {
    if (!listings) ////////Continua
  }, [])

  const formatPlaceholder = () => {
    if(!listings) return

    if(listings.type === ListingType.Direct) {
      return "Enter Offer Amount"
    }

    if(listings.type === ListingType.Auction) {
      return "Enter Bid Amount"
    }
  }

  if (isLoading)
    return(
      <div>
        <Header />
        <div className="text-center animate-pulse text-blue-500" >
          <p>Loading Item...</p>
        </div>
      </div>
    )

  if (!listings) {
    return <div>Listing not found</div>
  }

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10" >
        <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl" >
          <MediaRenderer src={listings.asset.image} />
        </div>

        <section className="flex-1 space-y-5 pd-20 lg:pb-0" >
          <div>
            <h1 className="text-xl font-bold pb-2 " >{listings.asset.name}</h1>
            <p className="text-gray-600 pb-2 " >{listings.asset.description}</p>
            <p className="flex items-center text-xs sm:text-base">
              <UserCircleIcon className="h-5" />
              <span className="font-bold pr-1" >Seller: </span>{listings.sellerAddress}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center py-2" >
            <p className="font-bold" >Listing Type:</p>
            <p>{listings.type === ListingType.Direct ? "Direct Listing" : "Auction Listing" }</p>
            <p className="font-bold" >Buy it Now Price: </p>
            <p className="text-4xl font-bold" >{listings.buyoutCurrencyValuePerToken.displayValue}{" "} 
            {listings.buyoutCurrencyValuePerToken.symbol}</p>

            <button className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10" >Buy Now</button>
          </div>

          <div className="grid grid-cols-2 space-y-2 items-center justify-end" >
            <hr className="col-span-2" />

            <p className="col-span-2 font-bold " >
              {listings.type === ListingType.Direct
                ? "Make an Offer"
                : "Bid on this Auction"
              }
            </p>
            
            {listings.type === ListingType.Auction && (
              <>
                <p>Current Minimum Bid: </p>
                <p>...</p>

                <p>Time Remaining: </p>
                <p>...</p>
              </>
            )}

            <input 
              className="border p-2 rounded-lg mr-5" 
              type="text" 
              placeholder={formatPlaceholder()} 
              
            />
            <button className="col-start-2 mt-2 bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10" >
              {listings.type === ListingType.Direct
              ? "Offer"
              : "Bid"
              }
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ListingPage