mongosh -- "$DATABASE_NAME" <<EOF
    var rootUser = '$DATABASE_ROOT_USERNAME';
    var rootPassword = '$DATABASE_ROOT_PASSWORD';
    var admin = db.getSiblingDB('admin');
    admin.auth(rootUser, rootPassword);
    var username = '$DATABASE_USERNAME';
    var password = '$DATABASE_PASSWORD';
    db.createUser({
      user: username,
      pwd: password,
      roles: ["readWrite"]
    });

    db.createCollection('Users');
    db.createCollection('ChatHistory');
EOF