const postsDiv = document.querySelector(".posts");

const createPostDiv = document.querySelector(".create-post");

const loginModal = document.querySelector("#login-modal");
const registerModal = document.querySelector("#register-modal");

// =========== infinite scrolling / Pagination ==============//

let currantPage = 1;
let lastPage = 1;

window.addEventListener("scroll", () => {
  // console.log(window.scrollY); //scrolled from top
  // console.log(window.innerHeight); //visible part of screen
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    currantPage <= lastPage
  ) {
    currantPage += 1;
    getPosts(false, currantPage);
  }
});
// =========== \\ infinite scrolling \\ ==============//

function getPosts(clear = false, page) {
  axios
    .get(`${baseUrl}/posts?limit=5&page=${page}`)
    .then(function (response) {
      // handle success

      lastPage = response.data.meta.last_page;
      let posts = response.data.data;
      let userId = localStorage.getItem("userId");
      let userPic;
      let postImg;

      if (clear) {
        postsDiv.innerHTML = "";
      }

      for (let post of posts) {
        let userName = post.author.username;
        let postUserId = post.author.id;
        let postId = post.id;
        let postTitle = post.title ?? "";
        let postBody = post.body;
        let postTime = post.created_at;
        let commentsCount = post.comments_count;
        let postStr = JSON.stringify(post);
        // let postTags = post.tags ?? [];

        if (typeof post.author.profile_image === "string") {
          userPic = post.author.profile_image;
        } else {
          userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
        }
        if (typeof post.image === "string") {
          postImg = post.image;
        } else {
          postImg = "";
        }

        let content = `
          <!-- post -->
          <div class="post card shadow-lg my-3">
            <div class="card-header">
              <div onclick="userClicked(${postUserId})" style="cursor: pointer;">
                <img class="profile_image border border-2" src=${userPic} alt="profile-image">
                <b>${userName}</b>
              </div>
              <div style="margin-left: auto;">
                ${
                  postUserId == userId
                    ? `
                    <button type="button" class="btn btn-primary m-1" onclick="openEditPostModal('${encodeURIComponent(
                      JSON.stringify(post)
                    )}')"> 
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="btn btn-danger m-1" onclick="openDeletePostModal('${encodeURIComponent(
                      JSON.stringify(post)
                    )}')"> 
                      <i class="fa-solid fa-trash"></i>
                    </button>
                      `
                    : ""
                }
              </div>
            </div>
    
            <div class="card-body" onclick="postClicked(${postId})" style="cursor: pointer;">
                ${
                  postImg
                    ? `<img class="w-100 border border-2 rounded" src="${postImg}" alt="post-image">`
                    : ""
                }
                ${
                  postTitle
                    ? `<h5 class="card-title mt-2">${postTitle}</h5>`
                    : ""
                }
              
              <p class="card-text">${postBody}</p>
    
              <h6 class="gray mt-1">${postTime}</h6>
              <hr>
              <div class="footer">
                <div class="comments d-flex align-items-center">
                  <h6>
                    (<span class="comments_number">${commentsCount}</span>)Comments
                  </h6>
                </div>
                <div class="tags">
                </div>
              </div>
            </div>
          </div>
          <!--\\ post //-->  
        `;
        postsDiv.insertAdjacentHTML("beforeend", content);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function registerFunction() {
  const userName = document.querySelector("#register-username-input").value;
  const password = document.querySelector("#register-password-input").value;
  const image = document.querySelector("#register-image-input").files[0];
  const name = document.querySelector("#register-name-input").value;
  // const email = document.querySelector("#register-email-input").value;

  let formData = new FormData();

  formData.append("username", userName);
  formData.append("password", password);
  formData.append("image", image);
  formData.append("name", name);
  // formData.append("email", email);

  axios
    .post(`${baseUrl}/register`, formData)
    .then(function (response) {
      // handle success
      let token = response.data.token;
      let user = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      bootstrap.Modal.getInstance(registerModal).hide();
      showAlert(`Create a new user successfully Welcome! ${name} 😘🫡`);
      setupUI();
    })
    .catch(function (error) {
      let errorMassage = error.response.data.message;
      showAlert(errorMassage, "danger");
    });
}

function loginFunction() {
  const userName = document.querySelector("#username-input").value;
  const password = document.querySelector("#password-input").value;

  localStorage.setItem("username", userName);

  const params = {
    username: `${userName}`,
    password: `${password}`,
  };

  axios
    .post(`${baseUrl}/login`, params)
    .then(function (response) {
      // handle success
      let token = response.data.token;
      let user = response.data.user;
      let userId = user.id;

      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      bootstrap.Modal.getInstance(loginModal).hide();
      setupUI();
      showAlert("Welcome!");
      getPosts();
    })
    .catch(function (error) {
      let errorMassage = error.response.data.message;
      showAlert(errorMassage, "danger");
    });
}

function logOutFunction() {
  localStorage.clear();
  setupUI();
  showAlert("Good Bay!", "danger");
}

function openCreatePostModal() {
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-button").innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  let editModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  editModal.toggle();
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

function createEditPostFunction() {
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

  let url;

  if (isCreate) {
    url = `${baseUrl}/posts`;
  } else {
    formData.append("_method", "PUT");
    url = `${baseUrl}/posts/${postId}`;
  }

  axios
    .post(url, formData, {
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
}

function deletePostFunction() {
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
      showAlert("The post has been Deleted successfully!");
      setupUI();
    })
    .catch(function (error) {
      let errorMassage = error.response.data.message;
      showAlert(errorMassage, "danger");
    });
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
    // ============ NO USER LOGIN OR USER LOG OUT =========
    buttonsDiv.innerHTML = `
      <button type="button" class="btn btn-outline-success mx-3" data-bs-toggle="modal" data-bs-target="#login-modal">Login</button>
      <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#register-modal">Register</button>
    `;
    postsDiv.innerHTML = "";
    userDataDiv.innerHTML = "";
    createPostDiv.innerHTML = "";
  } else {
    // =================== USER LOGIN =====================
    getPosts(true, 1);

    let user = JSON.parse(localStorage.getItem("user"));
    let userPic;

    if (typeof user.profile_image === "string") {
      userPic = user.profile_image;
    } else {
      userPic = `./images/user-img/user-img-${randomInteger(1, 7)}.jpg`;
    }

    document.querySelector(
      "#post-body-input"
    ).placeholder = `What are you thinking?...${user.name}`;

    userDataDiv.innerHTML = `
      <img class="profile_image border border-2" src="${userPic}" alt="profile-image">
      <b class="username">${user.username}</b>
    `;

    buttonsDiv.innerHTML = `
    <button type="button" class="btn btn-outline-danger" onclick="logOutFunction()">Log Out</button>`;

    createPostDiv.innerHTML = `
      <button type="button" class="create-post-btn shadow rounded-circle" onclick="openCreatePostModal()">
        <i class="fa-regular fa-pen-to-square"></i>
      </button>
    `;
  }
}

setupUI();
