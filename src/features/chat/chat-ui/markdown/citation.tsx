"use client";
import { FC, useState } from "react";
import { CitationSlider } from "./citation-slider";
// import { blobFileHandler } from "../../blob-services/blob-file-handler";
// import { s } from "@markdoc/markdoc/dist/src/schema";
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
  const citations = props.items.reduce((acc, citation) => {
    const { name } = citation;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(citation);
    return acc;
  }, {} as Record<string, Citation[]>);

  const blobName = props.items[0].name;
  const blobPage = props.items[0].page;
  // console.log(citations)

  return (
    <div className="interactive-citation p-4 border mt-4 flex flex-col rounded-md gap-2">
      {Object.entries(citations).map(([name, items], index: number) => {
        return (
          <div key={index} className="flex flex-col gap-2">
            <div className="font-semibold text-sm">{name}</div>
            <div className="flex flex-wrap">
              {items.map((item, index: number) => {
                return (
                  <div key={index}>
                    <CitationSlider
                      items={item.page}
                      blobName={blobName}
                      blobPage={blobPage}
                      index={index + 1}
                      name={item.name}
                      id={item.id}
                    />
                  </div>
                );
              })}
              {/* <CitationPDFSlider blobName={blobName} blobPage={blobPage}/>  */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
