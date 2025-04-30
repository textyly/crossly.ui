import { IRepositoryClient } from "./types.js";

export class RepositoryClient implements IRepositoryClient {

    public async save(data: Uint8Array): Promise<void> {
        fetch('http://localhost:5026/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Encoding': 'gzip'
            },
            body: data
          })
            .then(response => response.json())
            .then(data => console.log('Created:', data))
            .catch(error => console.error('POST error:', error));
    }

    public async read(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
}