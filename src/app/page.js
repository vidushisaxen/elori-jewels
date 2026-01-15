import React from 'react'
import Hero from '../components/Hero'
import Journey from '../components/Journey'
import OverlappingCollage from '../components/OverlappingCollage'
import Necklaces from '../components/Necklaces'
import Earrings from '../components/Earrings'
import { getAllCollections } from "./lib/shopify";
import Rings from "../components/Rings";
import Loader from "../components/Loader";

export default async function page() {
  const collections = await getAllCollections();
  return (
    <>
      <Loader />
      <Hero />
      <Necklaces />
         <OverlappingCollage />
      <Earrings />
      <Journey collections={collections} />
      <Rings />
       </>
  );
}
