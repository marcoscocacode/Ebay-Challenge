import { BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline"
import {
  useActiveListings,
  useContract,
  MediaRenderer,
} from "@thirdweb-dev/react"
import { ListingType } from "@thirdweb-dev/sdk"
import Header from "../components/Header"
import Link from "next/link"
import { useRouter } from "next/router"

const Home = () => {
  const router = useRouter()
  const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, "marketplace")
  const { data: listings, isLoading: loadingListings } = 
    useActiveListings(contract)

  

  return (
    <div className="">
      <Header/>
      <main className="max-w-6xl mx-auto p-2" >
        {loadingListings ? (
          <p className="text-center animate-pulse text-blue-500" >Loading Listings...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto" >
            {listings?.map(listings => (
              <div
                key={listings.id}
                onClick={() => router.push(`/listing/${listings.id}`)}
                className="flex flex-col card hover:scale-105 transition-all duration-150 ease-out" 
              >
                <div className="flex-1 flex flex-col pb-2 items-center" >
                  < MediaRenderer 
                    className="w-44"
                    src={listings.asset.image} 
                  />
                </div>
                <div className="pt-2 space-y-4 " >
                  <div>
                    <h2 className="text-lg truncate" >{listings.asset.name}</h2>
                    <hr />
                    <p className="truncate text-sm text-gray-600 mt-2" >{listings.asset.description}</p>
                  </div>
                  <p>
                    <span className="font-bold mr-1 "> {listings.buyoutCurrencyValuePerToken.displayValue} </span>{listings.buyoutCurrencyValuePerToken.symbol}
                  </p>

                  <div className={`flex items-center space-x-1 justify-end text-xs border w-fit ml-auto p-2 rounded-lg
                  text-white ${listings.type === ListingType.Direct ? "bg-blue-500" : "bg-red-500"} `}>
                    <p>
                      {listings.type === ListingType.Direct 
                        ? "Buy Now"
                        : "Auction"
                      }
                    </p>
                    {listings.type === ListingType.Direct ? (
                      <BanknotesIcon className="h-4" />
                    ): (
                      <ClockIcon className="h-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
