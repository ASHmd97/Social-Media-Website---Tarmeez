const baseUrl = "https://tarmeezacademy.com/api/v1";
const urlPrams = new URLSearchParams(window.location.search);
const pagePostId = urlPrams.get("postId");

const buttonsDiv = document.querySelector(".buttons");
const userDataDiv = document.querySelector(".user-data");
const postModal = document.querySelector("#create-post-modal");
const deleteModal = document.querySelector("#delete-post-modal");
const userPostsDiv = document.querySelector(".user-posts");

const randomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function postClicked(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

function userClicked(userId) {
  window.location = `profile.html?userId=${userId}`;
}

function createEditPostFunction(page = "home") {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == "";

  const title = document.querySelector("#post-title-input").value;
  const post = document.querySelector("#post-body-input").value;
  const image = document.querySelector("#post-image-input").files[0];
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("image", image);
  formData.append("body", post);
  formData.append("title", title);

  if (isCreate) {
    axios
      .post(`${baseUrl}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${token}`,
        },
      })
      .then(function (response) {
        // handle success
        bootstrap.Modal.getInstance(postModal).hide();
        showAlert("The post has been published successfully.🥳");
        setupUI();
      })
      .catch(function (error) {
        let errorMassage = error.response.data.message;
        showAlert(errorMassage, "danger");
      });
  } else {
    formData.append("_method", "PUT");

    axios
      .post(`${baseUrl}/posts/${postId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${token}`,
        },
      })
      .then(function (response) {
        // handle success
        bootstrap.Modal.getInstance(postModal).hide();
        if (page == "home") {
          getPosts();
        } else if (page == "postDetails") {
          getPost(id);
        } else if (page == "profile") {
          check();
        }
        setupUI();
        showAlert("The post has been Updated successfully.🥳");
      })
      .catch(function (error) {
        let errorMassage = error.response.data.message;
        showAlert(errorMassage, "danger");
      });
  }
}

function openEditPostModal(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-button").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;

  let editModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  editModal.toggle();
}

function openDeletePostModal(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("post-id-input").value = post.id;

  let editModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal"),
    {}
  );
  editModal.toggle();
}

function deletePostFunction(page = "home") {
  let postId = document.getElementById("post-id-input").value;
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("_method", "DELETE");
  url = `${baseUrl}/posts/${postId}`;

  axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    })
    .then(function (response) {
      // handle success
      bootstrap.Modal.getInstance(deleteModal).hide();
      if (page == "home") {
        getPosts();
      } else if (page == "postDetails") {
        postDiv.innerHTML = "";
      } else if (page == "profile") {
        check();
      }
      setupUI();
      showAlert("The post has been Deleted successfully!");
    })
    .catch(function (error) {
      let errorMassage = error.response.data.message;
      showAlert(errorMassage, "danger");
    });
}

function logOutFunction() {
  localStorage.clear();
  window.location = "index.html";
  setupUI();
  showAlert("Good Bay!", "danger");
}

function showAlert(customMas, type = "success") {
  const alertPlaceholder = document.getElementById("alert");

  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div id="myAlert" class="fade show alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  appendAlert(customMas, type);

  setTimeout(() => {
    const alert = bootstrap.Alert.getOrCreateInstance("#myAlert");
    alert.close();
  }, 4000);
}

function setupUI() {
  const token = localStorage.getItem("token");

  if (!token) {
    // ==== NO USER LOGIN OR USER LOG OUT ====
    userDataDiv.innerHTML = "";
    userPostsDiv.innerHTML = "";
  } else {
    // ===== USER LOGIN =====

    let user = JSON.parse(localStorage.getItem("user"));
    let userPic;

    if (typeof user.profile_image === "string") {
      userPic = user.profile_image;
    } else {
      userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
    }

    userDataDiv.innerHTML = `
      <img class="profile_image border border-2" src="${userPic}" alt="profile-image">
      <b class="username">${user.username}</b>
    `;

    buttonsDiv.innerHTML = `
    <button type="button" class="btn btn-outline-danger" onclick="logOutFunction()">Log Out</button>`;
  }
}
