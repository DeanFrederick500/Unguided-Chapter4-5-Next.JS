"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, Trash2, Search, Filter, Eye, Pencil, Check } from "lucide-react";

export default function ShipmentsPage() {
  const router = useRouter();

  const [flights, setFlights] = useState<{ flight_number: string; status: string }[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [itemTypes, setItemTypes] = useState<string[]>([]);

  const cities = [
    { code: "JKT", name: "Jakarta" },
    { code: "SBY", name: "Surabaya" },
    { code: "BDG", name: "Bandung" },
    { code: "SMG", name: "Semarang" },
    { code: "YIA", name: "Yogyakarta" },
    { code: "SOC", name: "Solo" },
    { code: "MLG", name: "Malang" },
    { code: "DPS", name: "Denpasar" },
    { code: "MDN", name: "Medan" },
    { code: "PKU", name: "Pekanbaru" },
    { code: "PLM", name: "Palembang" },
    { code: "BPN", name: "Balikpapan" },
    { code: "SMD", name: "Samarinda" },
    { code: "MKS", name: "Makassar" },
    { code: "MND", name: "Manado" },
    { code: "JMB", name: "Jambi" },
    { code: "BJM", name: "Banjarmasin" },
    { code: "PNK", name: "Pontianak" },
    { code: "BTM", name: "Batam" },
    { code: "AMQ", name: "Ambon" },
  ];

  const calculatePrice = (
    jenisBarang: string,
    berat: number,
    asal: string,
    tujuan: string,
    jenisPengiriman: string
  ) => {
    const rates: Record<string, number> = {
      "General Cargo": 10000,
      "Small Cargo": 15000,
      "Medium Cargo": 20000,
      "Large Cargo": 25000,
      "Heavy Cargo": 35000,
    };

    const shippingMultiplier: Record<string, number> = {
      "Standard": 1,
      "Express": 1.5,
      "Priority": 2,
    };

    const zone1 = [
      "Jakarta",
      "Bandung",
      "Semarang",
      "Yogyakarta",
      "Solo",
      "Surabaya",
      "Malang",
    ];

    const zone2 = [
      "Denpasar",
      "Medan",
      "Pekanbaru",
      "Palembang",
      "Batam",
      "Jambi",
    ];

    const zone3 = [
      "Makassar",
      "Balikpapan",
      "Samarinda",
      "Manado",
      "Ambon",
      "Pontianak",
      "Banjarmasin",
    ];

    const getZone = (city: string) => {
      const cityName = city.split(" (")[0];

      if (zone1.includes(cityName)) return 1;
      if (zone2.includes(cityName)) return 2;
      return 3;
    };

    const rate = rates[jenisBarang] || 10000;

    const originZone = getZone(asal);
    const destinationZone = getZone(tujuan);

    let routeCost = 50000;

    if (originZone !== destinationZone) {
      routeCost = 150000;
    }

    if (
      (originZone === 1 && destinationZone === 3) ||
      (originZone === 3 && destinationZone === 1)
    ) {
      routeCost = 250000;
    }

    const multiplier =
      shippingMultiplier[jenisPengiriman] || 1;

    return Math.round(
      (berat * rate + routeCost) * multiplier
    );
  };

  const loadShipments = async () => {
    try {
      const response = await fetch("/api/shipments");
      const data = await response.json();

      // De-duplikasi data berdasarkan awb_number agar tidak muncul 2 kali
      const uniqueData = Array.isArray(data)
        ? Array.from(new Map(data.map((item: any) => [item.awb_number, item])).values())
        : [];

      const formatted = uniqueData
        .map(formatShipment);
      setShipments(formatted);
    } catch (error) {
      setShipments([]);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    fetch("/api/flights")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        // De-duplikasi berdasarkan flight_number agar key di select unik, filter data kosong
        const unique = Array.from(
          new Map(
            list
              .filter((f: any) => f && f.flight_number)
              .map((f: any) => [f.flight_number, f])
          ).values()
        ) as { flight_number: string; status: string }[];
        setFlights(unique);
      })
      .catch(() => {
        setFlights([]);
      });

    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        // Mengambil properti vehicle_name dari database, filter nilai null/kosong, lalu de-duplikasi
        const names = list
          .map((v: any) => (typeof v === 'string' ? v : v?.vehicle_name || v?.name))
          .filter((name: any): name is string => typeof name === 'string' && name.trim() !== '');
        
        const uniqueNames = Array.from(
          new Set(names)
        ) as string[];

        setVehicles(uniqueNames);
      })
      .catch(() => {
        setVehicles([]);
      });
    
    fetch("/api/item-types")
      .then((res) => res.json())
      .then((data) => {
        console.log("API /api/item-types response:", data); // Debugging: Log API response
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        const types = list
          .map((t: any) => (typeof t === 'string' ? t : t?.item_type || t?.name || t?.type_name))
          .filter((t: any): t is string => typeof t === 'string' && t.trim() !== '');
        
        const uniqueTypes = Array.from(
          new Set(types)
        ) as string[];

        setItemTypes(uniqueTypes);
        console.log("Processed unique item types:", uniqueTypes); // Debugging: Log processed types
        setItemTypes(uniqueTypes);
      })
      .catch(() => {
        setItemTypes([]);
      });
  }, []);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [deleteData, setDeleteData] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [successModal, setSuccessModal] = useState({ open: false, message: "", awb: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [flightError, setFlightError] = useState("");
  const [beratError, setBeratError] = useState("");
  const [hargaError, setHargaError] = useState("");

  const getFlightStatus = (flightNumber: string) => {
    const flight = flights.find((f) => f.flight_number === flightNumber);
    return flight?.status || "Received";
  };

  const [form, setForm] = useState({
    tanggal: "",
    pengirim: "",
    penerima: "",
    telepon: "",
    teleponPenerima: "",
    asal: "",
    tujuan: "",
    namaBarang: "",
    jenisBarang: "",
    berat: "",
    harga: "",
    kendaraan: "",
    jenisPengiriman: "",
    flight: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (
      form.jenisBarang &&
      form.berat &&
      form.asal &&
      form.tujuan &&
      form.jenisPengiriman
    ) {
      const price = calculatePrice(
        form.jenisBarang,
        Number(form.berat),
        form.asal,
        form.tujuan,
        form.jenisPengiriman
      );

      setForm((prev) => ({
        ...prev,
        harga: String(price),
      }));
    }
  }, [
    form.jenisBarang,
    form.berat,
    form.asal,
    form.tujuan,
    form.jenisPengiriman
  ]);

  useEffect(() => {
    if (
      editData &&
      editData.jenisBarang &&
      editData.berat &&
      editData.asal &&
      editData.tujuan &&
      editData.jenisPengiriman
    ) {
      const price = calculatePrice(
        editData.jenisBarang,
        Number(editData.berat),
        editData.asal,
        editData.tujuan,
        editData.jenisPengiriman
      );

      setEditData((prev: any) => ({
        ...prev,
        harga: String(price),
      }));
    }
  }, [
    editData?.jenisBarang,
    editData?.berat,
    editData?.asal,
    editData?.tujuan,
    editData?.jenisPengiriman,
  ]);

  const generateAWB = () => {
    const randomNumber = Math.floor(
      100000000 + Math.random() * 900000000
    );

    return `AWB${randomNumber}`;
  };

  const excludedShipmentDescriptions = new Set([
    "Logistik medis darurat",
    "Baterai kendaraan listrik",
    "Produk fashion premium",
  ]);

  const excludedShipmentTypes = new Set([
    "Emergency Cargo",
    "Hazardous Cargo",
    "Fashion Cargo",
  ]);

  const isExcludedShipment = (item: any) =>
    excludedShipmentDescriptions.has(item.item_description) ||
    excludedShipmentTypes.has(item.item_type);

  const formatShipment = (item: any) => ({
    id: item.id,
    awb: item.awb_number,
    tanggal: new Date(item.shipment_date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    pengirim: item.sender_name,
    penerima: item.receiver_name,
    telepon: item.phone_number,
    teleponPenerima: item.receiver_phone_number,
    asal: item.origin_city,
    tujuan: item.destination_city,
    jenisBarang: item.item_type,
    berat: item.weight,
    harga: item.shipping_price,
    kendaraan: item.vehicle_name,
    jenisPengiriman: item.shipping_type,
    flight: item.flight_number,
    status: item.shipment_status,
    deskripsi: item.item_description,
    item_name: item.item_name,
    quantity: item.quantity,
    item_status: item.item_status,
    admin_fee: item.admin_fee,
    total_price: item.total_price,
    payment_method: item.payment_method,
    payment_date: item.payment_date,
    transaction_status: item.transaction_status,
  });

  // FILTER
  const filtered = shipments.filter(s => {
    const searchText = search.toLowerCase();
    const matchSearch =
      s.awb.toLowerCase().includes(searchText) ||
      s.penerima.toLowerCase().includes(searchText) ||
      s.pengirim.toLowerCase().includes(searchText) ||
      (s.flight || "").toLowerCase().includes(searchText) ||
      (s.item_name || "").toLowerCase().includes(searchText);
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.tanggal) errors.tanggal = "Shipment Date is required";
    if (!form.pengirim) errors.pengirim = "Sender Name is required";
    if (!form.penerima) errors.penerima = "Receiver Name is required";
    if (!form.telepon) errors.telepon = "Sender Phone Number is required";
    if (!form.teleponPenerima) errors.teleponPenerima = "Receiver Phone Number is required";
    if (!form.asal) errors.asal = "Origin is required";
    if (!form.tujuan) errors.tujuan = "Destination is required";
    if (
      form.asal &&
      form.tujuan &&
      form.asal === form.tujuan
    ) {
      errors.tujuan = "Destination city cannot be the same as the origin city";
    }
    if (!form.namaBarang) errors.namaBarang = "Item Name is required";
    if (!form.jenisBarang) errors.jenisBarang = "Cargo Type is required";
    if (!form.berat) errors.berat = "Weight is required";
    if (!form.harga) errors.harga = "Shipping Cost is required";
    if (!form.kendaraan) errors.kendaraan = "Vehicle Type is required";
    if (!form.jenisPengiriman) errors.jenisPengiriman = "Shipping Type is required";
    if (!form.flight) errors.flight = "Flight Number is required";
    if (!form.deskripsi) errors.deskripsi = "Cargo Description is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEdit = () => {
    const errors: Record<string, string> = {};
    if (!editData.item_name) errors.item_name = "Item Name is required";
    if (!editData.jenisBarang) errors.jenisBarang = "Cargo Type is required";
    if (!editData.berat) errors.berat = "Weight is required";
    if (!editData.telepon) errors.telepon = "Sender Phone Number is required";
    if (!editData.teleponPenerima) errors.teleponPenerima = "Receiver Phone Number is required";
    if (!editData.kendaraan) errors.kendaraan = "Vehicle Type is required";
    if (!editData.jenisPengiriman) errors.jenisPengiriman = "Shipping Type is required";
    if (!editData.harga) errors.harga = "Shipping Cost is required";
    if (!editData.flight) errors.flight = "Flight Number is required";
    if (!editData.asal) errors.asal = "Origin is required";
    if (!editData.tujuan) errors.tujuan = "Destination is required";
    if (
      editData.asal &&
      editData.tujuan &&
      editData.asal === editData.tujuan
    ) {
      errors.tujuan = "Destination city cannot be the same as the origin city";
    }
    if (!editData.status) errors.status = "Status is required";
    if (!editData.deskripsi) errors.deskripsi = "Cargo Description is required";

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedFlight = flights.find((f) => f.flight_number === form.flight);
    if (!selectedFlight) {
      setFlightError("Flight not found");
      return;
    }

    setFlightError("");

    if (beratError || hargaError) {
      alert("Weight and Shipping Cost must be valid numbers.");
      return;
    }

    const newAwb = generateAWB();
    const newData = {

      awb_number: newAwb,

      shipment_date: form.tanggal,

      sender_name: form.pengirim,
      receiver_name: form.penerima,
      phone_number: form.telepon,
      receiver_phone_number: form.teleponPenerima,

      origin_city: form.asal,
      destination_city: form.tujuan,

      shipping_type: form.jenisPengiriman,
      shipment_status: selectedFlight.status || "Received",

      vehicle_name: form.kendaraan,
      flight_number: form.flight,

      item_name: form.namaBarang,
      item_type: form.jenisBarang,
      item_description: form.deskripsi,

      quantity: 1,
      weight: Number(form.berat),

      item_status: "safe",

      shipping_price: Number(form.harga),
      admin_fee: 0,
      total_price: Number(form.harga),

      payment_method: "Transfer Bank",
      payment_date: form.tanggal,

      transaction_status: "Completed",

    };

    const response = await fetch("/api/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    if (response.ok) {
      await loadShipments();
      setOpen(false);
      setSuccessModal({
        open: true,
        message: "Shipment added successfully.",
        awb: newAwb,
      });

      setForm({
        tanggal: "",

        pengirim: "",
        penerima: "",
        telepon: "",
        teleponPenerima: "",

        asal: "",
        tujuan: "",

        namaBarang: "",
        jenisBarang: "",

        berat: "",

        harga: "",

        kendaraan: "",

        jenisPengiriman: "",

        flight: "",

        deskripsi: "",
      });

      setFormErrors({});
    } else {

      const errorData = await response.json();

      console.log(errorData);

      alert(errorData.error || "Failed to add shipment");

    }
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateEdit()) return;

    const selectedFlight = flights.find((f) => f.flight_number === editData.flight);
    if (!selectedFlight) {
      alert("Flight not found. Please select a valid flight.");
      return;
    }

    const response = await fetch("/api/shipments", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editData.id,
        shipment_date: editData.tanggal,
        sender_name: editData.pengirim,
        receiver_name: editData.penerima,
        phone_number: editData.telepon,
        receiver_phone_number: editData.teleponPenerima,
        origin_city: editData.asal,
        destination_city: editData.tujuan,
        shipping_type: editData.jenisPengiriman,
        shipment_status: editData.status,
        vehicle_name: editData.kendaraan,
        flight_number: editData.flight,
        item_name: editData.item_name ?? editData.jenisBarang,
        item_type: editData.jenisBarang,
        item_description: editData.deskripsi,
        quantity: editData.quantity ?? 1,
        weight: Number(editData.berat),
        item_status: editData.item_status ?? "safe",
        shipping_price: Number(editData.harga),
        admin_fee: editData.admin_fee ?? 5000,
        total_price: Number(editData.harga) + (editData.admin_fee ?? 5000),
        payment_method: editData.payment_method ?? "Transfer Bank",
        payment_date: editData.payment_date ?? editData.tanggal,
        transaction_status: editData.transaction_status ?? "paid",
      }),
    });

    if (response.ok) {
      await loadShipments();
      setEditData(null);
      setSuccessModal({
        open: true,
        message: "Shipment updated.",
        awb: editData.awb,
      });
    } else {
      alert("Failed to update shipment.");
    }
  };

  

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Shipment</h1>
          <p className="text-gray-500 text-sm">
            Manage and monitor all cargo shipment data
          </p>
        </div>

        <button
          onClick={() => {
            setOpen(true);
            setFormErrors({});
          }}
          className="bg-blueprimary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
        >
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Find AWB, Flight Number, Sender, Receiver..."
            className="w-full border rounded-lg pl-10 pr-3 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="border rounded-lg px-4 h-10 min-w-[150px] bg-white flex items-center gap-2"
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {statusFilter || "All Status"}
            </span>
            <span className="text-xs text-gray-400 pl-5">▼</span>


          </button>

          {showFilter && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow w-40 z-10">
              <button onClick={() => { setStatusFilter(""); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">All Status</button>
              <button onClick={() => { setStatusFilter("Received"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Received</button>
              <button onClick={() => { setStatusFilter("In Transit"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">In Transit</button>
              <button onClick={() => { setStatusFilter("Delivered"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Delivered</button>
            </div>
          )}
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Sender</th>
              <th className="p-3 text-left">Receiver</th>
              {/* <th className="p-3 text-left">Telepon Pengirim</th>
              <th className="p-3 text-left">Telepon Penerima</th> */}
              <th className="p-3 text-left">Origin</th>
              <th className="p-3 text-left">Destination</th>
              {/* <th className="p-3 text-left">Nama Barang</th> */}
              {/* <th className="p-3 text-left">Harga</th>
              <th className="p-3 text-left">Jenis Kendaraan</th>
              <th className="p-3 text-left">Jenis Pengiriman</th> */}
              <th className="p-3 text-left">Flight Number</th>
              <th className="p-3 text-left text-center">Status</th>
              <th className="p-3 text-left text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 text-blueprimary font-semibold cursor-pointer hover:underline" onClick={() => router.push(`/admin/shipments/${s.awb}`)}>{s.awb}</td>

                <td className="p-3">{s.tanggal}</td>

                <td className="p-3">{s.pengirim}</td>

                <td className="p-3">{s.penerima}</td>

                {/* <td className="p-3">{s.telepon || "-"}</td>

                <td className="p-3">{s.teleponPenerima || "-"}</td> */}

                <td className="p-3">{s.asal}</td>

                <td className="p-3">{s.tujuan}</td>

                {/* <td className="p-3">{s.item_name || "-"}</td> */}

                {/* <td className="p-3">Rp {s.harga}</td> */}

                {/* <td className="p-3">{s.kendaraan || "-"}</td> */}

                {/* <td className="p-3">{s.jenisPengiriman}</td> */}

                <td className="p-3">{s.flight || "-"}</td>

                <td className="p-3 text-center">
                  {s.status === "In Transit" && <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">In Transit</span>}
                  {s.status === "Received" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Received</span>}
                  {s.status === "Delivered" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Delivered</span>}
                  {s.status === "Scheduled" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Scheduled</span>}
                  {s.status === "Departed" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Departed</span>}
                  {s.status === "Delayed" && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">Delayed</span>}
                  {s.status === "Landed" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Landed</span>}
                  {s.status !== "In Transit" &&
                   s.status !== "Received" &&
                   s.status !== "Delivered" &&
                   s.status !== "Scheduled" &&
                   s.status !== "Departed" &&
                   s.status !== "Delayed" &&
                   s.status !== "Landed" && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{s.status}</span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-3">

                    <Eye
                      className="text-blue-500 cursor-pointer"
                      size={18}
                      onClick={() => router.push(`/admin/shipments/${s.awb}`)}
                    />

                    <Pencil
                      className="text-yellow-500 cursor-pointer"
                      size={18}
                      onClick={() => {
                        setEditData(s);
                        setNewStatus(s.status);
                        setEditErrors({});
                      }}
                    />

                    <Trash2
                      className="text-red-600 cursor-pointer"
                      size={18}
                      onClick={() => setDeleteData(s)}
                    />

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4">

          <button
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : ""
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            className="px-3 py-1 border rounded"
            onClick={() =>
              setCurrentPage(p => Math.min(totalPages, p + 1))
            }
          >
            Next
          </button>

        </div>
      )}

      {/* MODAL TAMBAH */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">

            <button onClick={() => {
              setOpen(false);
              setFormErrors({});
            }} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Add New Shipment
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* TANGGAL KIRIM */}
              <div>
                <label className="text-sm">Shipment Date</label>

                <input
                  type="date"
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.tanggal ? 'border-red-500' : ''}`}
                  value={form.tanggal}
                  onChange={(e) => {
                    setForm({ ...form, tanggal: e.target.value });
                    if (formErrors.tanggal) setFormErrors({ ...formErrors, tanggal: "" });
                  }}
                />
                {formErrors.tanggal && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal}</p>}
              </div>

              {/* JENIS PENGIRIMAN */}
              <div>
                <label className="text-sm">Shipping Type</label>

                <select
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.jenisPengiriman ? 'border-red-500' : ''}`}
                  value={form.jenisPengiriman}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      jenisPengiriman: e.target.value,
                    });
                    if (formErrors.jenisPengiriman) setFormErrors({ ...formErrors, jenisPengiriman: "" });
                  }}
                >
                  <option value="">Select Shipping Type</option>
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Priority">Priority</option>
                </select>
                {formErrors.jenisPengiriman && <p className="text-red-500 text-xs mt-1">{formErrors.jenisPengiriman}</p>}
              </div>

              {/* PENGIRIM */}
              <div>
                <label className="text-sm">Sender Name</label>

                <input
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.pengirim ? 'border-red-500' : ''}`}
                  value={form.pengirim}
                  onChange={(e) => {
                    setForm({ ...form, pengirim: e.target.value });
                    if (formErrors.pengirim) setFormErrors({ ...formErrors, pengirim: "" });
                  }}
                />
                {formErrors.pengirim && <p className="text-red-500 text-xs mt-1">{formErrors.pengirim}</p>}
              </div>

              {/* PENERIMA */}
              <div>
                <label className="text-sm">Receiver Name</label>

                <input
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.penerima ? 'border-red-500' : ''}`}
                  value={form.penerima}
                  onChange={(e) => {
                    setForm({ ...form, penerima: e.target.value });
                    if (formErrors.penerima) setFormErrors({ ...formErrors, penerima: "" });
                  }}
                />
                {formErrors.penerima && <p className="text-red-500 text-xs mt-1">{formErrors.penerima}</p>}
              </div>

              {/* TELEPON */}
              <div>
                <label className="text-sm">Sender Phone Number</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    formErrors.telepon ? "border-red-500" : ""
                  }`}
                  value={form.telepon}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 13);

                    setForm({
                      ...form,
                      telepon: value,
                    });

                    if (formErrors.telepon) {
                      setFormErrors({
                        ...formErrors,
                        telepon: "",
                      });
                    }
                  }}
                />

                {formErrors.telepon && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.telepon}
                  </p>
                )}
              </div>

              {/* TELEPON PENERIMA */}
              <div>
                <label className="text-sm">Receiver Phone Number</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    formErrors.teleponPenerima ? "border-red-500" : ""
                  }`}
                  value={form.teleponPenerima}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 13);

                    setForm({
                      ...form,
                      teleponPenerima: value,
                    });

                    if (formErrors.teleponPenerima) {
                      setFormErrors({
                        ...formErrors,
                        teleponPenerima: "",
                      });
                    }
                  }}
                />

                {formErrors.teleponPenerima && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.teleponPenerima}
                  </p>
                )}
              </div>

              {/* NAMA BARANG */}
              <div>
                <label className="text-sm">Item Name</label>

                <input
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.namaBarang ? 'border-red-500' : ''}`}
                  value={form.namaBarang}
                  onChange={(e) => {
                    setForm({ ...form, namaBarang: e.target.value });
                    if (formErrors.namaBarang) setFormErrors({ ...formErrors, namaBarang: "" });
                  }}
                />
                {formErrors.namaBarang && <p className="text-red-500 text-xs mt-1">{formErrors.namaBarang}</p>}
              </div>

              {/* JENIS BARANG */}
              <div>
                <label className="text-sm">Cargo Type</label>
                <select
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.jenisBarang ? 'border-red-500' : ''}`}
                  value={form.jenisBarang}
                  onChange={(e) => {
                    setForm({ ...form, jenisBarang: e.target.value });
                    if (formErrors.jenisBarang) setFormErrors({ ...formErrors, jenisBarang: "" });
                  }}
                >
                  <option value="">Select Cargo Type</option>
                  {itemTypes.map((type) => (
                    <option key={`add-item-${type}`} value={type}>{type}</option>
                  ))}
                  {itemTypes.length === 0 && ( // Fallback options if API returns no item types
                    <>
                      <option value="General Cargo">General Cargo</option>
                      <option value="Small Cargo">Small Cargo</option>
                      <option value="Medium Cargo">Medium Cargo</option>
                      <option value="Large Cargo">Large Cargo</option>
                      <option value="Heavy Cargo">Heavy Cargo</option>
                    </>
                  )}
                </select>
                {formErrors.jenisBarang && <p className="text-red-500 text-xs mt-1">{formErrors.jenisBarang}</p>}
              </div>

              {/* ASAL */}
              <div>
                <label className="text-sm">Origin</label>
                <select
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.asal ? 'border-red-500' : ''}`}
                  value={form.asal}
                  onChange={(e) => {
                    setForm({ ...form, asal: e.target.value });
                    if (formErrors.asal) setFormErrors({ ...formErrors, asal: "" });
                  }}
                >
                  <option value="">Select Origin City</option>
                  {cities.map((city) => (
                    <option key={city.code} value={`${city.name} (${city.code})`}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
                {formErrors.asal && <p className="text-red-500 text-xs mt-1">{formErrors.asal}</p>}
              </div>

              {/* TUJUAN */}
              <div>
                <label className="text-sm">Destination</label>
                <select
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.tujuan ? 'border-red-500' : ''}`}
                  value={form.tujuan}
                  onChange={(e) => {
                    setForm({ ...form, tujuan: e.target.value });
                    if (formErrors.tujuan) setFormErrors({ ...formErrors, tujuan: "" });
                  }}
                >
                  <option value="">Select Destination City</option>
                  {cities.map((city) => (
                    <option key={city.code} value={`${city.name} (${city.code})`}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
                {formErrors.tujuan && <p className="text-red-500 text-xs mt-1">{formErrors.tujuan}</p>}
              </div>

              {/* BERAT */}
              <div>
                <label className="text-sm">Weight (kg)</label>
                <input
                  type="number"
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.berat || beratError ? 'border-red-500' : ''}`}
                  value={form.berat}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, berat: val });
                    if (formErrors.berat) setFormErrors({ ...formErrors, berat: "" });
                    if (val === "" || isNaN(Number(val))) {
                      setBeratError("Please enter a valid number");
                    } else {
                      setBeratError("");
                    }
                  }}
                />
                {(formErrors.berat || beratError) && <p className="text-red-500 text-xs mt-1">{formErrors.berat || beratError}</p>}
              </div>

              {/* HARGA */}
              <div>
                <label className="text-sm">Shipping Cost</label>
                <input
                  type="number"
                  readOnly
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.harga || hargaError ? 'border-red-500' : ''} cursor-not-allowed bg-gray-100`}
                  value={form.harga}
                  // onChange={(e) => {
                  //   const val = e.target.value;
                  //   setForm({ ...form, harga: val });
                  //   if (formErrors.harga) setFormErrors({ ...formErrors, harga: "" });
                  //   if (val === "" || isNaN(Number(val))) {
                  //     setHargaError("Anda harus memasukkan angka");
                  //   } else {
                  //     setHargaError("");
                  //   }
                  // }}
                />
                {(formErrors.harga || hargaError) && <p className="text-red-500 text-xs mt-1">{formErrors.harga || hargaError}</p>}
              </div>

              {/* JENIS KENDARAAN */}
              <div>
                <label className="text-sm">Vehicle Type</label>

                <select
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.kendaraan ? 'border-red-500' : ''}`}
                  value={form.kendaraan}
                  onChange={(e) => {
                    setForm({ ...form, kendaraan: e.target.value });
                    if (formErrors.kendaraan) setFormErrors({ ...formErrors, kendaraan: "" });
                  }}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={`add-veh-${vehicle}`} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
                {formErrors.kendaraan && <p className="text-red-500 text-xs mt-1">{formErrors.kendaraan}</p>}
              </div>

              {/* FLIGHT */}
              <div>
                <label className="text-sm">Flight Number</label>
                <select
                  value={form.flight}
                  onChange={(e) => {
                    setForm({ ...form, flight: e.target.value });
                    setFlightError("");
                    if (formErrors.flight) setFormErrors({ ...formErrors, flight: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.flight || flightError ? "border-red-500" : ""}`}
                >
                  <option value="">Select Flight Number</option>
                  {flights.map((flight) => (
                    <option key={`create-flight-${flight.flight_number}`} value={flight.flight_number}>
                      {flight.flight_number}
                    </option>
                  ))}
                </select>

                {(formErrors.flight || flightError) && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.flight || flightError}
                  </p>
                )}
              </div>


              {/* DESKRIPSI */}
              <div>
                <label className="text-sm">Cargo Description</label>

                <textarea
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${formErrors.deskripsi ? 'border-red-500' : ''}`}
                  value={form.deskripsi}
                  onChange={(e) => {
                    setForm({ ...form, deskripsi: e.target.value });
                    if (formErrors.deskripsi) setFormErrors({ ...formErrors, deskripsi: "" });
                  }}
                />
                {formErrors.deskripsi && <p className="text-red-500 text-xs mt-1">{formErrors.deskripsi}</p>}
              </div>

              {/* BUTTON */}
              <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => {
                  setOpen(false);
                  setFormErrors({});
                }} className="border py-2 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg">
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">

            <button onClick={() => {
              setEditData(null);
              setEditErrors({});
            }} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Update Shipment
            </h2>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* BARIS 1 */}
              <div>
                <label className="text-sm">Item Name</label>

                <input
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.item_name ? 'border-red-500' : ''}`}
                  value={editData.item_name || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, item_name: e.target.value });
                    if (editErrors.item_name) setEditErrors({ ...editErrors, item_name: "" });
                  }}
                />
                {editErrors.item_name && <p className="text-red-500 text-xs mt-1">{editErrors.item_name}</p>}
              </div>

              <div>
                <label className="text-sm">Cargo Type</label>

                <select
                  value={editData.jenisBarang || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, jenisBarang: e.target.value });
                    if (editErrors.jenisBarang) setEditErrors({ ...editErrors, jenisBarang: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.jenisBarang ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Cargo Type</option>
                  {itemTypes.map((type) => (
                    <option key={`edit-item-${type}`} value={type}>{type}</option>
                  ))}
                  {itemTypes.length === 0 && ( // Fallback options if API returns no item types
                    <>
                      <option value="General Cargo">General Cargo</option>
                      <option value="Small Cargo">Small Cargo</option>
                      <option value="Medium Cargo">Medium Cargo</option>
                      <option value="Large Cargo">Large Cargo</option>
                      <option value="Heavy Cargo">Heavy Cargo</option>
                    </>
                  )}
                </select>
                {editErrors.jenisBarang && <p className="text-red-500 text-xs mt-1">{editErrors.jenisBarang}</p>}
              </div>

              <div>
                <label className="text-sm">Weight (kg)</label>

                <input
                  type="number"
                  value={editData.berat || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, berat: e.target.value });
                    if (editErrors.berat) setEditErrors({ ...editErrors, berat: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.berat ? 'border-red-500' : ''}`}
                />
                {editErrors.berat && <p className="text-red-500 text-xs mt-1">{editErrors.berat}</p>}
              </div>

              {/* BARIS 2 */}
              <div>
                <label className="text-sm">Sender Phone Number</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={editData.telepon || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setEditData({
                      ...editData,
                      telepon: value,
                    });

                    if (editErrors.telepon)
                      setEditErrors({
                        ...editErrors,
                        telepon: "",
                      });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    editErrors.telepon ? "border-red-500" : ""
                  }`}
                />
                {editErrors.telepon && <p className="text-red-500 text-xs mt-1">{editErrors.telepon}</p>}
              </div>

              <div>
                <label className="text-sm">Receiver Phone Number</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={editData.teleponPenerima || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setEditData({
                      ...editData,
                      teleponPenerima: value,
                    });

                    if (editErrors.teleponPenerima)
                      setEditErrors({
                        ...editErrors,
                        teleponPenerima: "",
                      });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    editErrors.teleponPenerima ? "border-red-500" : ""
                  }`}
                />
                {editErrors.teleponPenerima && <p className="text-red-500 text-xs mt-1">{editErrors.teleponPenerima}</p>}
              </div>

              {/* BARIS 3 */}
              <div>
                <label className="text-sm">Vehicle Type</label>
                <select
                  value={editData.kendaraan || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, kendaraan: e.target.value });
                    if (editErrors.kendaraan) setEditErrors({ ...editErrors, kendaraan: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.kendaraan ? 'border-red-500' : ''}`}
                >
                  <option value="">Vehicle Type</option>
                  {vehicles.map((vehicle) => (
                    <option key={`edit-veh-${vehicle}`} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
                {editErrors.kendaraan && <p className="text-red-500 text-xs mt-1">{editErrors.kendaraan}</p>}
              </div>

              <div>
                <label className="text-sm">Shipping Type</label>

                <select
                  value={editData.jenisPengiriman || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, jenisPengiriman: e.target.value });
                    if (editErrors.jenisPengiriman) setEditErrors({ ...editErrors, jenisPengiriman: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.jenisPengiriman ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Shipping Type</option>
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Priority">Priority</option>
                </select>
                {editErrors.jenisPengiriman && <p className="text-red-500 text-xs mt-1">{editErrors.jenisPengiriman}</p>}
              </div>

              {/* BARIS 4 */}
              <div>
                <label className="text-sm">Shipping Cost</label>

                <input
                  type="number"
                  readOnly
                  value={editData.harga || ""}
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
                />
                {editErrors.harga && <p className="text-red-500 text-xs mt-1">{editErrors.harga}</p>}
              </div>

              <div>
                <label className="text-sm">Flight Number</label>
                <select
                  value={editData.flight || ""}
                  onChange={(e) => {
                    const selectedFlight = flights.find((f) => f.flight_number === e.target.value);
                    setEditData({
                      ...editData,
                      flight: e.target.value,
                      status: selectedFlight ? selectedFlight.status : editData.status,
                    });
                    if (editErrors.flight) setEditErrors({ ...editErrors, flight: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.flight ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Flight Number</option>
                  {flights.map((flight) => (
                    <option key={`edit-flight-${flight.flight_number}`} value={flight.flight_number}>
                      {flight.flight_number}
                    </option>
                  ))}
                </select>
                {editErrors.flight && <p className="text-red-500 text-xs mt-1">{editErrors.flight}</p>}
              </div>

              {/* BARIS 5 */}
              <div>
                <label className="text-sm">Origin</label>
                <select
                  value={editData.asal || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, asal: e.target.value });
                    if (editErrors.asal) setEditErrors({ ...editErrors, asal: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    editErrors.asal ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Origin City</option>

                  {cities.map((city) => (
                    <option
                      key={`edit-origin-${city.code}`}
                      value={`${city.name} (${city.code})`}
                    >
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
                {editErrors.asal && <p className="text-red-500 text-xs mt-1">{editErrors.asal}</p>}
              </div>

              <div>
                <label className="text-sm">Destination</label>
                <select
                  value={editData.tujuan || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, tujuan: e.target.value });
                    if (editErrors.tujuan) setEditErrors({ ...editErrors, tujuan: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                    editErrors.tujuan ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Destination City</option>

                  {cities.map((city) => (
                    <option
                      key={`edit-destination-${city.code}`}
                      value={`${city.name} (${city.code})`}
                    >
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
                {editErrors.tujuan && <p className="text-red-500 text-xs mt-1">{editErrors.tujuan}</p>}
              </div>

              {/* BARIS 6 */}
              <div>
                <label className="text-sm">Status</label>
                <select
                  value={editData.status || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, status: e.target.value });
                    if (editErrors.status) setEditErrors({ ...editErrors, status: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.status ? 'border-red-500' : ''}`}
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Received">Received</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Departed">Departed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Landed">Landed</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {editErrors.status && <p className="text-red-500 text-xs mt-1">{editErrors.status}</p>}
              </div>

              <div>
                <label className="text-sm">Cargo Description</label>

                <textarea
                  value={editData.deskripsi || ""}
                  onChange={(e) => {
                    setEditData({ ...editData, deskripsi: e.target.value });
                    if (editErrors.deskripsi) setEditErrors({ ...editErrors, deskripsi: "" });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editErrors.deskripsi ? 'border-red-500' : ''}`}
                />
                {editErrors.deskripsi && <p className="text-red-500 text-xs mt-1">{editErrors.deskripsi}</p>}
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditData(null);
                    setEditErrors({});
                  }}
                  className="border py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 rounded-lg"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {deleteData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-[500px] rounded-xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Are you sure you want to delete this shipment?
            </h2>

            <p className="text-gray-600 text-1xl mb-8">
              {deleteData.awb}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteData(null)}
                className="border py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={async () => {

                  const response = await fetch("/api/shipments", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: deleteData.id,
                    }),
                  });

                  if (response.ok) {
                    await loadShipments();
                    setSuccessModal({
                      open: true,
                      message: "Shipment deleted successfully.",
                      awb: deleteData.awb,
                    });
                    setDeleteData(null);

                  } else {

                    alert("Failed to Delete Shipment");

                  }
                }}
                className="bg-blue-700 text-white py-3 rounded-xl"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {successModal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white w-[400px] rounded-xl p-8 text-center shadow-lg relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold mb-4">{successModal.message}</h2>
            <p className="text-gray-600 mb-1">AWB Number:</p>
            <p className="text-2xl font-bold text-blue-700 mb-8">{successModal.awb}</p>
            <button
              onClick={() => setSuccessModal({ open: false, message: "", awb: "" })}
              className="bg-blue-600 text-white px-10 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}