# Error Handling

State yang perlu didukung:

- Loading data
- Empty data
- API error
- Data delayed
- Offline/disconnected
- Dummy mode indicator

Service layer saat ini melempar error ketika response API tidak berhasil. Client hook `useAsyncData` menyediakan `loading`, `error`, dan `empty` untuk komponen client.
