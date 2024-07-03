import { PinataConfigAttributes } from "../../types/config";
import FormData from 'form-data';
import axios from 'axios';
import internal from "stream";
class PinataAPi {

    public pinFilesToIPFS = async (fileStream: internal.Readable, pinataCredientials: PinataConfigAttributes,) => {

        try {
            const formData = new FormData();
            formData.append("file", fileStream, {
                filepath: "image.png",
            });
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                    Authorization: `Bearer ${pinataCredientials.PinataToken}`,
                },
            });
            return response.data.IpfsHash
        } catch (err) {
            return false
        }
    }

}
export default PinataAPi