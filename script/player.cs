using UnityEngine;

public class player : MonoBehaviour
{
    public Rigidbody rb;
    public float forwardForce = 2000f;
    public float sidewaysForce = 500f;
    void Update()
    {
        rb.AddForce(-forwardForce * Time.deltaTime, 0, 0);
        if (Input.GetKey("a"))
        {
            rb.AddForce(0, 0, -sidewaysForce * Time.deltaTime, ForceMode.VelocityChange);
        }
        if (Input.GetKey("d"))
        {
            rb.AddForce(0, 0, sidewaysForce * Time.deltaTime, ForceMode.VelocityChange);
        }
        if(rb.position.y<-0.5f)
        {
            FindObjectOfType<gamemanager>().Endgame();
        }
    }
}
