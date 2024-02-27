"use client";
import { FC, useState } from "react";
import { CitationSlider } from "./citation-slider";
import { blobFileHandler } from "../../blob-services/blob-file-handler";
import { s } from "@markdoc/markdoc/dist/src/schema";
import { CitationPDFSlider } from "./citation-pdf-slider";

interface Citation {
  page: any;
  name: string;
  id: string;
}

interface Props {
  items: Citation[];
}

export const citation = {
  render: "Citation",
  selfClosing: true,
  attributes: {
    items: {
      type: Array,
    },
  },
};

export const Citation: FC<Props> = (props: Props) => {
  // group citations by name
  console.log(props);
  const citations = props.items.reduce((acc, citation) => {
    const { name } = citation;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(citation);
    return acc;
  }, {} as Record<string, Citation[]>);
  console.log(citations);
    
    //here getting blob sas token to fetch pdf from azure blob storage
    // const [blobName, setBlobName] = useState<string | undefined>();
    // setBlobName(props.items[0].name)
    const blobName = props.items[0].name;
    const blobPage = props.items[0].page;
    console.log(blobPage)
    // console.log(blobName)
    // const prop={
    //   blobName: blobName??"",
    // }
    // const sastoken = blobFileHandler(prop);
    // console.log(sastoken);
  return (
    <div className="interactive-citation p-4 border mt-4 flex flex-col rounded-md gap-2">
      {Object.entries(citations).map(([name, items], index: number) => {
       
        return (
          <div key={index} className="flex flex-col gap-2">
            <div className="font-semibold text-sm">{name}</div>
            <div >
              {items.map((item, index: number) => {
                
                return (
                  <div key={index}>
                     <CitationSlider
                      index={index + 1}
                      name={item.name}
                      id={item.id}
                    /> 
                  </div>
                );
              })}
              <CitationPDFSlider blobName={blobName} blobPage={blobPage}/> 
            </div>
          </div>
        );
      })
      
      }
       
    </div>
  );
};
