document.addEventListener("DOMContentLoaded", () => {
  const dataList = document.getElementById("data-list");
  const dataForm = document.getElementById("data-form");
  const dataInput = document.getElementById("data-input");
  const errorMsg = document.getElementById("errorMsg");

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch("/data");
      const data = await response.json();
      dataList.innerHTML = ""; // Clear the list before rendering

      data.forEach((item) => {
        const li = document.createElement("li");
        //li.textContent = item.id + ": " + JSON.stringify(item);
        li.textContent = item.text;

        // Handle edit data
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn btn-sm btn-outline-secondary mx-2 ms-auto";

        editBtn.addEventListener("click", async () => {
          const newText = prompt("Edit item:", item.text);
          if (newText !== null && newText.trim() !== "") {
            try {
              const res = await fetch(`/data/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newText }),
              });
              if (res.ok) fetchData();
            } catch (err) {
              console.error("Error updating item:", err);
            }
          }
        });

        // Handle delete data
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-sm btn-outline-danger ms-2";

        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this item?")) {
            try {
              const res = await fetch(`/data/${item.id}`, {
                method: "DELETE",
              });
              if (res.ok) fetchData();
            } catch (err) {
              console.error("Error deleting item:", err);
            }
          }
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        dataList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle form submission to add new data
  dataForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dataInputValue = dataInput.value.trim();
    errorMsg.style.display = "none";

    // Check for duplicate data in the backend data
    const response = await fetch("/data");
    const existingData = await response.json();
    const isDuplicate = existingData.some((item) => item.text.toLowerCase() === dataInputValue.toLowerCase());

    if (isDuplicate) {
      if (errorMsg) {
        errorMsg.textContent = "This note already exists. Please review your input.";
        errorMsg.style.display = "block";
      }
      return; // Stop the form submission if duplicate found
    }

    const newData = { text: dataInput.value };

    try {
      const response = await fetch("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        dataInput.value = ""; // Clear input field
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding data:", error);
    }
  });

  // Fetch data on page load
  fetchData();
});
