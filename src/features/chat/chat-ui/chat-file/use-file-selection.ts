import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import {
  IndexDocuments,
  UploadDocument,
} from "../../chat-services/chat-document-service";
import { useChatContext } from "../chat-context";
import { UploadtoBlob } from "../../blob-services/blob-file-upload";

interface Props {
  id: string;
}

export const useFileSelection = (props: Props) => {
  const { setChatBody, chatBody, fileState } = useChatContext();
  const { setIsUploadingFile, setUploadButtonLabel } = fileState;

  const { showError, showSuccess } = useGlobalMessageContext();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onFileChange(formData);
  };

  const onFileChange = async (formData: FormData) => {
    try {
      setIsUploadingFile(true);
      setUploadButtonLabel("Uploading document...");

      // Extract files from formData
      // Extract files from formData
      const files: FileList | null = (formData.getAll("file") as unknown) as FileList;


      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.set("file", file);

        formData.append("id", props.id);
        //here we are uploading file to blob storage
        const blobUploadDone = await UploadtoBlob(formData);
        // console.log(blobUploadDone); //console for status of blob upload
        const uploadResponse = await UploadDocument(formData);

        if (uploadResponse.success) {
          let index = 0;

          for (const doc of uploadResponse.response) {
            setUploadButtonLabel(
              `Indexing document [${index + 1}]/[${
                uploadResponse.response.length
              }]`
            );
            try {
              const indexResponse = await IndexDocuments(
                file.name,
                [doc],
                props.id
              );

              if (!indexResponse.success) {
                showError(indexResponse.error);
                break;
              }
            } catch (e) {
              alert(e);
            }

            index++;
          }

          if (index === uploadResponse.response.length) {
            showSuccess({
              title: "File upload",
              description: `${file.name} uploaded successfully.`,
            });
            setUploadButtonLabel("");
            setChatBody({ ...chatBody, chatOverFileName: file.name });
          } else {
            showError(
              "Looks like not all documents were indexed. Please try again."
            );
          }
        } else {
          showError(uploadResponse.error);
        }
      }
    } catch (error) {
      showError("" + error);
    } finally {
      setIsUploadingFile(false);
      setUploadButtonLabel("");
    }
  };

  return { onSubmit };
};
