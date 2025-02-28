CREATE TRIGGER insert_location_after_user
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    INSERT INTO Location (description, userid) 
    VALUES ('Default Location', NEW.userid);
END;
