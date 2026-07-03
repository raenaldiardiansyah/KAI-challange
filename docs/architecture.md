# Architecture

Development flow:

Frontend component -> service/hook -> dummy data

Integration flow:

Frontend component -> service/hook -> REKA backend API

TEL-U tidak membuat backend utama, MQTT subscriber, database, analytic engine, rule base FMEA, atau LLM. Frontend hanya menampilkan data siap tampil dari API/service layer.
