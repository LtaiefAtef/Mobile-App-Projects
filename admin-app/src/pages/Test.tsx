"use client"
import { useEffect, useState } from "react";

function TEST() {
    const [ imgSrc, setImgSrc ] = useState("");
    useEffect(()=>{
        async function getImage(){
            try{
                const res = await fetch("http://192.168.11.61:5000/images");
                console.log(await res.json());
            }catch(e){
                console.log("ERROR",e);
            }
        }
        getImage();
    },[])
  return (
    <div>
      <img
        src={"http://192.168.11.61:5000/file/083eba32-4300-44cc-a013-768bc08ce965.png"}
        alt="Example"
        style={{ width: "300px", height: "200px", objectFit: "cover" }}
      />
    </div>
  );
}

export default TEST;