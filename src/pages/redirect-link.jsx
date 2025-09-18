import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/use-fetch';
import { getLongUrl } from '../db/apiUrls';
import { BarLoader } from 'react-spinners';
import { storeClicks } from '../db/apiClicks';

const RedirectLink = () => {
  const { id } = useParams();

  const { loading, data, fn } = useFetch(getLongUrl, id);

  useEffect(() => {
    const redirect = async () => {
      await fn(); // fetch long URL
    };
    redirect();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      // Log click asynchronously, does NOT block redirect
      storeClicks({ id: data.id });

      // Redirect immediately
      window.location.href = data.original_url;
    }
  }, [loading, data]);

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

export default RedirectLink;
