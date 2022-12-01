import { ethers } from "ethers";
import Countdown from "react-countdown"
import { useRouter } from "next/router";
import network from "../../utils/network";
import Header from "../../components/Header";
import { ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import React, { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid"
import { 
  MediaRenderer, 
  useContract, 
  useListing,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useMakeOffer,
  useOffers,
  useBuyNow,
  useAddress, 
  useAcceptDirectListingOffer
} from "@thirdweb-dev/react";

function ListingPage() {
  const router = useRouter()
  const address = useAddress()
  const [, switchNetwork] = useNetwork()
  const networkMismatch = useNetworkMismatch()
  const [bidAmount, setBidAmount] = useState("")
  const { listingId }  = router.query as { listingId: string }
  
  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string
    symbol: string
  }>()
  
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  )

  const {mutate: buyNow} = useBuyNow(contract)
  const {mutate: makeBid} = useMakeBid(contract)
  const {mutate: makeOffer} = useMakeOffer(contract)
  const {mutate: acceptOffer } = useAcceptDirectListingOffer(contract)

  const {data: offers} = useOffers(contract, listingId)
    
  const { data: listings, isLoading, error } = useListing(contract, listingId)

  useEffect(() => {
    if (!listingId || !contract || !listings ) return
    
    if (listings.type === ListingType.Auction ) {
      fetchMinNextBid()
    }
  }, [listingId, listings, contract])

  const fetchMinNextBid =async () => {
    if (!listingId || !contract ) return

    const {displayValue, symbol} = await contract.auction.getMinimumNextBid(
      listingId
    )

    setMinimumNextBid({
      displayValue: displayValue,
      symbol: symbol,
    })
  }

  const formatPlaceholder = () => {
    if(!listings) return

    if(listings.type === ListingType.Direct) {
      return "Enter Offer Amount"
    }

    if(listings.type === ListingType.Auction) {
      return Number(minimumNextBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumNextBid?.displayValue}  ${minimumNextBid?.symbol} or more`
    }
  }

  const buyNFT = async () => {
    if(networkMismatch) {
      switchNetwork && switchNetwork(network)
      return
    }

    if(!listingId || !contract || !listings) return

    await buyNow ({
      id: listingId,
      buyAmount: 1,
      type: listings.type,
    }, 
    {
      onSuccess(data, _variables, _context) {
        alert("NFT bought successfully!")
        console.log("SUCCESS", data)
        router.replace("/")
      },
      onError(error, variables, context) {
        alert("ERROR: NFT could not be bought")
        console.log("ERROR", error, variables, context)
      }
    })
  }

  const createBidOrOffer = async () => {
    try {
      if(networkMismatch) {
        switchNetwork && switchNetwork(network)
        return
      }

      if(listings?.type === ListingType.Direct) { //Direct Listing
        if(listings.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
          alert("Buyout Price met, buying NFT...")
          buyNFT()
          return
        }

        alert("Buyout price not met, making a offer...")
        await makeOffer({
          quantity: 1,
          listingId,
          pricePerToken: bidAmount,
        }, {
          onSuccess(data, _variables, _context) {
            alert("Offer made successfully")
            console.log("SUCCESS", data)
            setBidAmount("")
          },
          onError(error, variables, context) {
            alert("ERROR: Offer could not be made")
            console.log("ERRROR:", error, variables, context)
          }
        })
      }

      if(listings?.type === ListingType.Auction) { //Auction Listing
        alert("Making Bid...")

        await makeBid ({
          listingId,
          bid: bidAmount
        }, {
          onSuccess(data, _variables, _context) {
              alert("Bid made successfully")
              console.log("SUCCESS:", data)
              setBidAmount("")
          },
          onError(error, variables, context) {
            alert("ERROR: Bid could not be made")
            console.log("ERROR:", error, variables, context)
          },
        })
      }
    } catch (error) {
      console.error(error)
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

            <button 
              onClick={buyNFT}
              className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10" >
              Buy Now
            </button>
          </div>

          {listings.type === ListingType.Direct && offers &&(
            <div className="grid grid-cols-2 gap-y-2">
              <p className="font-bold" >Offers: </p>
              <p className="font-bold" >
                {offers.length > 0
                ? offers.length
                : 0}
              </p>

              {offers.map(offer => (
                <>
                  <p className="flex items-center ml-5 text-sm italic" >
                    <UserCircleIcon className="h-3 mr-2" />
                    {offer.offeror.slice(0, 5) +
                      "..." +
                      offer.offeror.slice(-5)}
                  </p>
                  <div>
                    <p
                      key={
                        offer.listingsId +
                        offer.offeror +
                        offer.totalOfferAmount.toString()
                      } 
                      className="text-sm italic" 
                    >
                      {ethers.utils.formatEther(offer.totalOfferAmount)} {" "}
                        {NATIVE_TOKENS[network].symbol}
                    </p>

                    {listings.sellerAddress === address && (
                      <button
                        onClick={() => {
                          acceptOffer({
                            listingId,
                            addressOfOfferor: offer.offeror,
                          }, {
                            onSuccess(data, _variables, _context) {
                                alert("Offer accepted successfully")
                                console.log("SUCCESS:", data)
                                setBidAmount("")
                            },
                            onError(error, variables, context) {
                              alert("ERROR: Offer could not be accepted")
                              console.log("ERROR:", error, variables, context)
                            },
                          })
                        }}
                        className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                      >

                      </button>
                    )}
                  </div>
                </>
              ))}
            </div>
          )}

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
                <p className="font-bold" >
                  {minimumNextBid?.displayValue}  {minimumNextBid?.symbol} 
                </p>

                <p>Time Remaining: </p>
                <Countdown
                  className="font-bold"
                  date={Number(listings.endTimeInEpochSeconds.toString()) * 1000}
                />
              </>
            )}

            <input 
              className="border p-2 rounded-lg mr-5" 
              onChange={e => setBidAmount(e.target.value)}
              type="text" 
              placeholder={formatPlaceholder()} 
              
            />
            <button 
              onClick={createBidOrOffer}
              className="col-start-2 mt-2 bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10" 
            >
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