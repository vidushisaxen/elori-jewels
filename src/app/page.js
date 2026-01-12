import React from 'react'
import Hero from '../components/Hero'
import Journey from '../components/Journey'
import OverlappingCollage from '../components/OverlappingCollage'
import JewelrySection from '../components/JewelleryItem'
import Necklaces from '../components/Necklaces'
import Earrings from '../components/Earrings'
import { getAllCollections } from "./lib/shopify";
import Rings from '../components/Rings'


export default async function page(){
   const collections = await getAllCollections();
  return (
   <>
  
   <Hero/>
   <Necklaces/>
   {/* <JewelrySection/> */}
   <OverlappingCollage/>
   <Earrings/>
   <Journey collections={collections}/>
   <Rings/>
   {/* <Products/> */}
   </>
  )
}

