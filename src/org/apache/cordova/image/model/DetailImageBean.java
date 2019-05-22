package org.apache.cordova.image.model;

import java.io.Serializable;

/**
 * Created by shangzh on 16/9/20.
 */
public class DetailImageBean implements Serializable {

    private String filePath;

    private Boolean isChecked;

    public void setChecked(Boolean checked) {
        isChecked = checked;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFilePath() {
        return filePath;
    }

    public Boolean getChecked() {
        return isChecked;
    }
}
