import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Copy,  Download, Trash } from 'lucide-react'
import useFetch from '../hooks/use-fetch'
import { deleteUrl } from '../db/apiUrls'
import { BeatLoader } from 'react-spinners'
import {toast } from 'react-toastify';

const LinkCard = ({url, fetchUrls}) => {
    const notify = () => toast("Link Copied");

    const downloadImage = async () => {
        try {
            const response = await fetch(url?.qr, { mode: "cors" });
            const blob = await response.blob();

            const blobUrl = URL.createObjectURL(blob);
            console.log(blobUrl);
            const anchor = document.createElement("a");
            anchor.href = blobUrl;
            anchor.download = `${url?.title}.png`;  // Add .png extension

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            // Release memory after download
            URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error("Failed to download image", error);
        }
    };


    const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, url?.id)

  return (
    <div className="flex flex-col md:flex-row gap-5 border p-4 bg-gray-900 rounded-lg">
        <img 
        className='h-32 object-contain ring ring-blue-500 self-start'
        src={url?.qr} alt='qr code' />

        <Link to={`/link/${url?.id}`} className='flex flex-col flex-1'>
        <span className="text-3xl font-extrabold hover:underline cursor-pointer">
            {url?.title}
        </span>
        <span className="text-2xl text-blue-400 font-bold hover:underline cursor-pointer">
            {/* {console.log(import.meta.env.VITE_BASE_URL + "hk")} */}
            {import.meta.env.VITE_BASE_URL}/{url?.custom_url ? url?.custom_url : url.short_url}
        </span>
        <span className="flex items-center gap-1 hover:underline cursor-pointer">{url?.original_url}</span>
        <span className='flex items-end font-extralight text-sm flex-1'>{new Date(url?.created_at).toLocaleString()}</span>
        </Link>

        <div className="flex gap-2">
            <Button variant="ghost"
                onClick = {()=>{
                    navigator.clipboard.writeText(`${import.meta.env.VITE_BASE_URL}/${url?.short_url}`)
                    notify()
                    }
                }
            >
                <Copy/>
            </Button>
            <Button variant="ghost" onClick={downloadImage}>
                <Download/>
            </Button>
            <Button variant="ghost" onClick={()=>fnDelete().then(()=>fetchUrls())}>
                {loadingDelete ? <BeatLoader size={5} color='white'/> : <Trash/>}
            </Button>
        </div>


    </div>
  )
}

export default LinkCard