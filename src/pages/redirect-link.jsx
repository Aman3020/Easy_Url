import React, { useEffect , useState} from 'react'
import { useParams } from 'react-router-dom'
import useFetch from '../hooks/use-fetch';
import { getLongUrl } from '../db/apiUrls';
import { BarLoader } from 'react-spinners';
import { storeClicks } from '../db/apiClicks';
// const RedirectLink = () => {
//   const {id} = useParams();

//   const {loading, data, fn} = useFetch(getLongUrl, id);
//   const {loading: loadingStats, fn:fnStats} = useFetch(storeClicks, {
//     id:data?.id,
//     originalUrl: data?.original_url,
//   });

//   useEffect(()=>{
//     fn();
//   }, [])

//   useEffect(()=>{
//     if(!loading && data){
//       fnStats();
//     }
//   }, [loading])

//   if(loading || loadingStats){
//     return (
//       <>
//         <BarLoader width={"100%"} color='#36d7b7' />
//         <br/>

//         Redirecting ....
//       </>
//     )
//   }

//   return null
// }


const RedirectLink = () => {
  const { id } = useParams(); // short URL identifier
  const [loading, setLoading] = useState(true);
  console.log(id);

  useEffect(() => {
    const doRedirect = async () => {
      // 1. Fetch original URL from Supabase `url` table
      try{

          const data = await getLongUrl(id);
    
          if (!data || !data.original_url) {
            console.error("Short URL not found", error);
            setLoading(false);
            return;
          }
    
          // 2. Log click (don’t wait for it to finish)
          storeClicks({ id: data.id });
    
          // 3. Redirect
          window.location.href = data.original_url;
      }catch(err){
        console.error("Redirect failed:", err);
        setLoading(false);
      }
    };

    doRedirect();
  }, [id]);

  if (loading) {
    return (
      <>
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        Redirecting ....
      </>
    );
  }

  return null;
};

export default RedirectLink