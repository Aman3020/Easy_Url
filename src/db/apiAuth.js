import supabase, { supabaseUrl } from "./supabase"

export async function login({email, password}){
    const {data, err}=  await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if(err) throw new Error(err.message);

    return data;
}

export async function getCurrentUser() {
  const { data: session, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return session.session ? session.session.user : null;
}

export async function signup({name, email, password, profile_pic}){
    // console.log(name, email, password, profile_pic);
    const fileName = `dp-${name.split(" ").join("-")}-${Math.random()}`
    const {error:storageError} = await supabase.storage.from("profile_pic").upload(fileName, profile_pic)

    if(storageError) throw new Error(storageError.message)
    const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options : {
                data : {
                    name,
                    profile_pic: `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`
                }
            }
        })
    console.log("hello")
    if(error) throw new Error(error.message);
    console.log("hello ji")

    return data;
}


export async function logout() {
    const {err} = await supabase.auth.signOut();
    if(err) throw new Error(err.message)
}