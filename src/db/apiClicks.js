import { UAParser } from "ua-parser-js";
import supabase from "./supabase";

export async function getClicksForUrls(urlIds) {
  const { data, error } = await supabase.from("clicks").select("*").in("url_id", urlIds)
  if (error){
    console.error(error.message)
    throw new Error("Unable to load Clicks");
  }
  return data;
}


// import { UAParser } from "ua-parser-js";
// import supabase from "./supabase";

export const storeClicks = ({ id }) => {
  try {
    const parser = new UAParser();
    const device = parser.getResult().device.type || "desktop";

    // Fetch geolocation from frontend asynchronously
    fetch("https://ipapi.co/json", { keepalive: true })
      .then(res => res.json())
      .then(async (data) => {
        const city = data.city || "unknown";
        const country = data.country_name || "unknown";

        // Insert click into Supabase asynchronously
        await supabase.from("clicks").insert({
          url_id: id,
          city,
          country,
          device,
        });
      })
      .catch(err => console.error("Error fetching geolocation:", err));

  } catch (error) {
    console.error("Error recording click:", error);
  }
};


export async function getClicksForUrl(url_id) {
  const { data, error } = await supabase
      .from("clicks")
      .select("*")
      .eq("url_id", url_id);


  if (error){
    console.error(error.message)
    throw new Error("Unable to load Stats");
  }
  return data;
}