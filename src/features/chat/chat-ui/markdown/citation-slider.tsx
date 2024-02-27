import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FC, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { CitationAction } from "./citation-action";
import { blobFileHandler } from "../../blob-services/blob-file-handler";

interface SliderProps {
  name: string;
  index: number;
  id: string;
  blobPage:any;
  blobName:any
}

export const CitationSlider: FC<SliderProps> = (props) => {
  const [node, formAction] = useFormState(CitationAction, null);
  const [sasToken, setSasToken] = useState<string | undefined>();
  const page = parseInt(props.blobPage ?? "0") + 1;
  useEffect(() => {
    const fetchData = async () => {
      const prop = {
        blobName: props.blobName ?? "",
      };
      const sastoken = await blobFileHandler(prop);
      setSasToken(sastoken);
    };

    fetchData();
  }, []);
  // console.log(node)
  // console.log(props.blobPage)
  return (
  <div className="flex">
      <form>
      <input type="hidden" name="id" value={props.id} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            formAction={formAction}
            type="submit"
            value={22}
          >
            P:{page}
          </Button>
        </SheetTrigger>
        <SheetContent size="LG">
          <SheetHeader>
            <SheetTitle>Citation</SheetTitle>
          </SheetHeader>
          {/* <div className="text-sm text-muted-foreground">{node}</div> */}
          <div className="flex">
            {sasToken ? (
              <iframe
                src={`${sasToken}#page=${page}`}
                width="650px"
                height="900px"
                allowFullScreen
              ></iframe>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </form>
  </div>
  );
};
